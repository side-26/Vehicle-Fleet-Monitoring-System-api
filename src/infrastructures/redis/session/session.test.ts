import { describe, expect, it } from 'vitest';

import { adminAccessTokenTtlSeconds, env } from '#src/configs/env.config';
import { redisKeys } from '#src/infrastructures/redis/redis.keys';

import { adminSessionSchema, createAdminSessionSchema } from './session.schema.ts';

const hash = 'a'.repeat(64);

describe('administrator session contracts', () => {
  it('keeps access token lifetime in authentication configuration', () => {
    expect(adminAccessTokenTtlSeconds).toBeLessThanOrEqual(env.ADMIN_SESSION_TTL);
  });
  it('uses the required Redis key patterns', () => {
    expect(redisKeys.adminSession('abc')).toBe('auth:admin:session:abc');
    expect(redisKeys.adminSessions('admin1')).toBe('auth:admin:sessions:admin1');
    expect(redisKeys.consumedRefresh('abc', hash)).toBe(`auth:admin:refresh-used:abc:${hash}`);
  });

  it('rejects malformed hashes and key IDs', () => {
    expect(
      createAdminSessionSchema.safeParse({
        adminId: 'admin1',
        refreshTokenHash: 'raw-token',
        device: { ip: '127.0.0.1', userAgent: 'test' },
      }).success,
    ).toBe(false);
    expect(() => redisKeys.adminSessions('admin:other')).toThrow();
  });

  it('validates immutable session timestamps', () => {
    const session = {
      id: 'b7ba9f61-0fc0-46ce-aa2f-c6ec8adf73a8',
      adminId: 'admin1',
      refreshTokenHash: hash,
      device: { ip: '127.0.0.1', userAgent: 'test' },
      createdAt: 1000,
      updatedAt: 1000,
      expiresAt: 2000,
    };
    expect(adminSessionSchema.safeParse(session).success).toBe(true);
    expect(adminSessionSchema.safeParse({ ...session, expiresAt: 1000 }).success).toBe(false);
  });
});
