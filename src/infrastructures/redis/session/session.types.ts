import type { z } from 'zod';

import type { adminSessionSchema, createAdminSessionSchema } from './session.schema.ts';

export type AdminSession = z.infer<typeof adminSessionSchema>;
export type CreateAdminSession = z.infer<typeof createAdminSessionSchema>;
export const rotationResults = [
  'ROTATED',
  'SESSION_NOT_FOUND',
  'SESSION_EXPIRED',
  'INVALID_REFRESH_TOKEN',
  'REFRESH_TOKEN_REUSED',
] as const;
export type RotateSessionResult = (typeof rotationResults)[number];

export interface AdminSessionRepository {
  create(input: CreateAdminSession): Promise<AdminSession>;
  findById(sessionId: string): Promise<AdminSession | null>;
  exists(sessionId: string): Promise<boolean>;
  findAllByAdminId(adminId: string): Promise<AdminSession[]>;
  rotateRefreshToken(
    sessionId: string,
    currentTokenHash: string,
    newTokenHash: string,
  ): Promise<RotateSessionResult>;
  revoke(sessionId: string): Promise<boolean>;
  revokeAll(adminId: string): Promise<number>;
  getTTL(sessionId: string): Promise<number>;
}
