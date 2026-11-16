import { z } from 'zod';

const keyIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);
const hashSchema = z.string().regex(/^[a-fA-F0-9]{64}$/);

export const redisKeys = {
  adminSession: (sessionId: string): string => `auth:admin:session:${keyIdSchema.parse(sessionId)}`,
  adminSessions: (adminId: string): string => `auth:admin:sessions:${keyIdSchema.parse(adminId)}`,
  consumedRefresh: (sessionId: string, tokenHash: string): string =>
    `auth:admin:refresh-used:${keyIdSchema.parse(sessionId)}:${hashSchema.parse(tokenHash).toLowerCase()}`,
};
