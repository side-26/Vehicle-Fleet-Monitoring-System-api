import { z } from 'zod';

export const refreshTokenHashSchema = z.string().regex(/^[a-fA-F0-9]{64}$/);
export const sessionIdSchema = z.uuid();
export const adminIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/);
export const adminSessionSchema = z
  .object({
    id: sessionIdSchema,
    adminId: adminIdSchema,
    refreshTokenHash: refreshTokenHashSchema,
    device: z.object({ ip: z.string().min(1), userAgent: z.string().min(1) }),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
    expiresAt: z.number().int().positive(),
  })
  .refine(
    (session) => session.updatedAt >= session.createdAt && session.expiresAt > session.createdAt,
  );
export const createAdminSessionSchema = z.object({
  adminId: adminIdSchema,
  refreshTokenHash: refreshTokenHashSchema,
  device: z.object({ ip: z.string().min(1), userAgent: z.string().min(1) }),
});
