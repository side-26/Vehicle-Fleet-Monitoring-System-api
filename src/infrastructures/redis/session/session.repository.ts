import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { env } from '#src/configs/env.config';
import { redisClient } from '#src/configs/redis.config';
import { redisKeys } from '#src/infrastructures/redis/redis.keys';
import { createSessionScript } from '#src/infrastructures/redis/session/scripts/create-session';
import { revokeAllSessionsScript } from '#src/infrastructures/redis/session/scripts/revoke-all-sessions';
import { revokeSessionScript } from '#src/infrastructures/redis/session/scripts/revoke-session';
import { rotateSessionScript } from '#src/infrastructures/redis/session/scripts/rotate-session';

import {
  adminIdSchema,
  adminSessionSchema,
  createAdminSessionSchema,
  refreshTokenHashSchema,
  sessionIdSchema,
} from './session.schema.ts';
import {
  rotationResults,
  type AdminSession,
  type AdminSessionRepository,
  type CreateAdminSession,
  type RotateSessionResult,
} from './session.types.ts';

interface RepositoryOptions {
  client?: typeof redisClient;
  sessionTtlSeconds?: number;
  now?: () => number;
  createId?: () => string;
}

export class RedisAdminSessionRepository implements AdminSessionRepository {
  private readonly client: typeof redisClient;
  private readonly ttlSeconds: number;
  private readonly now: () => number;
  private readonly createId: () => string;

  constructor(options: RepositoryOptions = {}) {
    this.client = options.client ?? redisClient;
    this.ttlSeconds = z
      .number()
      .int()
      .positive()
      .parse(options.sessionTtlSeconds ?? env.ADMIN_SESSION_TTL);
    this.now = options.now ?? Date.now;
    this.createId = options.createId ?? randomUUID;
  }

  async create(input: CreateAdminSession): Promise<AdminSession> {
    const valid = createAdminSessionSchema.parse(input);
    const now = this.now();
    const session = adminSessionSchema.parse({
      ...valid,
      refreshTokenHash: valid.refreshTokenHash.toLowerCase(),
      id: this.createId(),
      createdAt: now,
      updatedAt: now,
      expiresAt: now + this.ttlSeconds * 1000,
    });
    const result = await this.client.eval(createSessionScript, {
      keys: [redisKeys.adminSession(session.id), redisKeys.adminSessions(session.adminId)],
      arguments: [
        JSON.stringify(session),
        String(this.ttlSeconds * 1000),
        String(session.expiresAt),
        session.id,
        String(now),
      ],
    });
    const code = z.number().parse(result);
    if (code === 0) throw new Error('Admin session ID collision');
    if (code === -1) throw new Error('Administrator session limit reached');
    if (code !== 1) throw new Error('Invalid administrator session index');
    return session;
  }

  async findById(sessionId: string): Promise<AdminSession | null> {
    const raw = await this.client.get(redisKeys.adminSession(sessionIdSchema.parse(sessionId)));
    if (raw === null) return null;
    const session = this.parseStoredSession(raw);
    return session.expiresAt > this.now() ? session : null;
  }

  private parseStoredSession(raw: string): AdminSession {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Invalid administrator session data');
    }
    const result = adminSessionSchema.safeParse(parsed);
    if (!result.success)
      throw new Error('Invalid administrator session data', { cause: result.error });
    return result.data;
  }

  async exists(sessionId: string): Promise<boolean> {
    return (await this.findById(sessionId)) !== null;
  }

  async findAllByAdminId(adminId: string): Promise<AdminSession[]> {
    const index = redisKeys.adminSessions(adminIdSchema.parse(adminId));
    await this.client.zRemRangeByScore(index, '-inf', this.now());
    const ids = await this.client.zRange(index, 0, -1);
    if (ids.length === 0) return [];
    const raw = await this.client.mGet(ids.map(redisKeys.adminSession));
    const sessions: AdminSession[] = [];
    const stale: string[] = [];
    for (const [position, id] of ids.entries()) {
      const item = raw[position];
      if (item == null) {
        stale.push(id);
        continue;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(item);
      } catch {
        throw new Error('Invalid administrator session data');
      }
      const result = adminSessionSchema.safeParse(parsed);
      if (!result.success)
        throw new Error('Invalid administrator session data', { cause: result.error });
      if (result.data.adminId !== adminId || result.data.expiresAt <= this.now()) stale.push(id);
      else sessions.push(result.data);
    }
    if (stale.length > 0) await this.client.zRem(index, stale);
    return sessions;
  }

  async rotateRefreshToken(
    sessionId: string,
    currentTokenHash: string,
    newTokenHash: string,
  ): Promise<RotateSessionResult> {
    const id = sessionIdSchema.parse(sessionId);
    const current = refreshTokenHashSchema.parse(currentTokenHash).toLowerCase();
    const next = refreshTokenHashSchema.parse(newTokenHash).toLowerCase();
    const raw = await this.client.get(redisKeys.adminSession(id));
    if (raw === null) return 'SESSION_NOT_FOUND';
    const session = this.parseStoredSession(raw);
    const result = await this.client.eval(rotateSessionScript, {
      keys: [redisKeys.adminSession(id), redisKeys.adminSessions(session.adminId)],
      arguments: [String(this.now()), 'auth:admin:refresh-used:', id, current, next],
    });
    return z.enum(rotationResults).parse(result);
  }

  async revoke(sessionId: string): Promise<boolean> {
    const session = await this.findById(sessionId);
    if (!session) return false;
    const result = await this.client.eval(revokeSessionScript, {
      keys: [redisKeys.adminSession(session.id), redisKeys.adminSessions(session.adminId)],
      arguments: [],
    });
    return z.number().parse(result) === 1;
  }

  async revokeAll(adminId: string): Promise<number> {
    const result = await this.client.eval(revokeAllSessionsScript, {
      keys: [redisKeys.adminSessions(adminIdSchema.parse(adminId))],
      arguments: ['auth:admin:session:'],
    });
    return z.number().int().nonnegative().parse(result);
  }

  async getTTL(sessionId: string): Promise<number> {
    return this.client.ttl(redisKeys.adminSession(sessionIdSchema.parse(sessionId)));
  }
}
