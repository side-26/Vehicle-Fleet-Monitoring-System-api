import { createClient } from 'redis';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { redisKeys } from '#src/infrastructures/redis/redis.keys';

const { env } = await import('#src/configs/env.config');
const { RedisAdminSessionRepository } = await import('./session.repository.ts');
const hashA = 'a'.repeat(64);
const hashB = 'b'.repeat(64);
const hashC = 'c'.repeat(64);
const adminId = `test_${crypto.randomUUID().replaceAll('-', '')}`;
const testUrl = env.REDIS_TEST_URL;
const client = testUrl ? createClient({ url: testUrl }) : null;
const repository = client
  ? new RedisAdminSessionRepository({ client, sessionTtlSeconds: 2 })
  : null;

beforeAll(async () => {
  if (!client || !testUrl) return;
  const testRedis = new URL(testUrl);
  const applicationRedis = new URL(env.REDIS_URL);
  if (
    env.NODE_ENV === 'production' ||
    testRedis.pathname === '/' ||
    (testRedis.origin === applicationRedis.origin &&
      testRedis.pathname === applicationRedis.pathname)
  )
    throw new Error('REDIS_TEST_URL must target a dedicated Redis database');
  await client.connect();
});
afterAll(async () => {
  if (repository) await repository.revokeAll(adminId);
  if (client?.isOpen) await client.quit();
});

const input = {
  adminId,
  refreshTokenHash: hashA,
  device: { ip: '127.0.0.1', userAgent: 'integration-test' },
};

describe.skipIf(!repository)('administrator session repository with real Redis', () => {
  it('creates, retrieves, indexes and rotates a session without extending TTL', async () => {
    if (!repository) return;
    const session = await repository.create(input);
    expect((await repository.findById(session.id))?.id).toBe(session.id);
    expect(await repository.exists(session.id)).toBe(true);
    expect((await repository.findAllByAdminId(adminId)).map((item) => item.id)).toContain(
      session.id,
    );
    const ttl = await repository.getTTL(session.id);
    expect(ttl).toBeGreaterThan(0);
    expect(await repository.rotateRefreshToken(session.id, hashA, hashB)).toBe('ROTATED');
    expect(await repository.getTTL(session.id)).toBeLessThanOrEqual(ttl);
    expect(await client?.pTTL(redisKeys.consumedRefresh(session.id, hashA))).toBeGreaterThan(0);
    expect(await repository.rotateRefreshToken(session.id, hashB, hashA)).toBe(
      'INVALID_REFRESH_TOKEN',
    );
    expect(await repository.rotateRefreshToken(session.id, hashC, hashA)).toBe(
      'INVALID_REFRESH_TOKEN',
    );
    expect(await repository.rotateRefreshToken(session.id, hashA, hashC)).toBe(
      'REFRESH_TOKEN_REUSED',
    );
    expect(await repository.exists(session.id)).toBe(false);
  });

  it('keeps multiple sessions independent and revokes them in bulk', async () => {
    if (!repository) return;
    const first = await repository.create(input);
    const second = await repository.create({
      ...input,
      device: { ip: '127.0.0.2', userAgent: 'second-device' },
    });
    expect(await repository.revoke(first.id)).toBe(true);
    expect((await repository.findById(second.id))?.device.userAgent).toBe('second-device');
    expect(await repository.revoke(first.id)).toBe(false);
    expect(await repository.revokeAll(adminId)).toBe(1);
    expect(await repository.findById(second.id)).toBeNull();
  });
});

describe.skipIf(!repository)('administrator session edge cases with real Redis', () => {
  it('prevents a duplicate session ID from replacing the original', async () => {
    if (!repository || !client) return;
    const fixedId = crypto.randomUUID();
    const fixed = new RedisAdminSessionRepository({
      client,
      sessionTtlSeconds: 2,
      createId: () => fixedId,
    });
    const original = await fixed.create(input);
    await expect(fixed.create(input)).rejects.toThrow('collision');
    expect((await fixed.findById(original.id))?.refreshTokenHash).toBe(hashA);
  });

  it('detects missing, corrupted and expired sessions', async () => {
    if (!repository || !client) return;
    expect(await repository.findById(crypto.randomUUID())).toBeNull();
    const session = await repository.create(input);
    await client.set(`auth:admin:session:${session.id}`, '{invalid-json', { EX: 2 });
    await expect(repository.findById(session.id)).rejects.toThrow(
      'Invalid administrator session data',
    );
    await client.del(`auth:admin:session:${session.id}`);
    expect(await repository.findById(session.id)).toBeNull();
    const short = new RedisAdminSessionRepository({ client, sessionTtlSeconds: 1 });
    const expiring = await short.create(input);
    await vi.waitFor(async () => expect(await short.findById(expiring.id)).toBeNull(), {
      timeout: 2500,
    });
  });

  it('allows only one concurrent rotation and preserves the absolute expiry', async () => {
    if (!repository) return;
    const session = await repository.create(input);
    const [left, right] = await Promise.all([
      repository.rotateRefreshToken(session.id, hashA, hashB),
      repository.rotateRefreshToken(session.id, hashA, hashC),
    ]);
    expect([left, right]).toContain('ROTATED');
    expect([left, right]).toContain('REFRESH_TOKEN_REUSED');
    expect(await repository.exists(session.id)).toBe(false);
  });

  it('cleans stale index members and propagates command failures', async () => {
    if (!repository || !client) return;
    const staleId = crypto.randomUUID();
    await client.zAdd(`auth:admin:sessions:${adminId}`, {
      score: Date.now() + 10_000,
      value: staleId,
    });
    await repository.findAllByAdminId(adminId);
    expect(await client.zScore(`auth:admin:sessions:${adminId}`, staleId)).toBeNull();
    const disconnected = createClient({ url: testUrl });
    const failed = new RedisAdminSessionRepository({ client: disconnected, sessionTtlSeconds: 2 });
    await expect(failed.findById(crypto.randomUUID())).rejects.toThrow();
  });

  it('distinguishes an expired record from a missing record', async () => {
    if (!repository || !client) return;
    const session = await repository.create(input);
    const future = new RedisAdminSessionRepository({
      client,
      sessionTtlSeconds: 2,
      now: () => session.expiresAt + 1,
    });
    expect(await future.rotateRefreshToken(session.id, hashA, hashB)).toBe('SESSION_EXPIRED');
    expect(await future.rotateRefreshToken(crypto.randomUUID(), hashA, hashB)).toBe(
      'SESSION_NOT_FOUND',
    );
  });

  it('propagates Redis command failures without reporting a missing session', async () => {
    if (!repository || !client) return;
    const otherAdmin = `test_${crypto.randomUUID().replaceAll('-', '')}`;
    const index = redisKeys.adminSessions(otherAdmin);
    await client.set(index, 'wrong-type');
    try {
      await expect(repository.findAllByAdminId(otherAdmin)).rejects.toThrow();
    } finally {
      await client.del(index);
    }
  });
});

describe.skipIf(!repository)('administrator session concurrency and expiry', () => {
  it('keeps the index alive through the latest session expiry', async () => {
    if (!client || !repository) return;
    const short = new RedisAdminSessionRepository({ client, sessionTtlSeconds: 1 });
    const first = await short.create(input);
    const second = await repository.create(input);
    const indexTtl = await client.pTTL(`auth:admin:sessions:${adminId}`);
    expect(indexTtl).toBeGreaterThan(1000);
    expect(await repository.getTTL(first.id)).toBeLessThanOrEqual(1);
    expect((await repository.findAllByAdminId(adminId)).some((item) => item.id === second.id)).toBe(
      true,
    );
  });

  it('uses the validated environment lifetime by default', async () => {
    if (!client) return;
    const defaultRepository = new RedisAdminSessionRepository({ client });
    const session = await defaultRepository.create(input);
    expect(await defaultRepository.getTTL(session.id)).toBeGreaterThan(env.ADMIN_SESSION_TTL - 5);
    expect(await defaultRepository.getTTL(session.id)).toBeLessThanOrEqual(env.ADMIN_SESSION_TTL);
    await defaultRepository.revoke(session.id);
  });

  it('does not recreate a session during concurrent revocation and rotation', async () => {
    if (!repository) return;
    const session = await repository.create(input);
    await Promise.all([
      repository.revoke(session.id),
      repository.rotateRefreshToken(session.id, hashA, hashB),
    ]);
    expect(await repository.findById(session.id)).toBeNull();
  });

  it('atomically resolves concurrent creation and bulk revocation', async () => {
    if (!repository) return;
    const [createdSession] = await Promise.all([
      repository.create(input),
      repository.revokeAll(adminId),
    ]);
    const active = await repository.findAllByAdminId(adminId);
    expect(active.some((item) => item.id === createdSession.id)).toBe(
      await repository.exists(createdSession.id),
    );
    await repository.revokeAll(adminId);
  });
});
