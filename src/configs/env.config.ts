import dotenv from 'dotenv';
import { z } from 'zod';

const nodeEnvironment = process.env.NODE_ENV ?? 'development';
const envFilePath = nodeEnvironment === 'production' ? '.env.production' : '.env.local';

dotenv.config({ path: envFilePath });

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} environment variable is required`);
  }

  return value;
};

const environmentSchema = z
  .object({
    NODE_ENV: z.string().min(1),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: z.string().min(1),
    REDIS_URL: z.string().min(1),
    REDIS_TEST_URL: z.string().url().optional(),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    LOG_LEVEL: z.string().optional(),
    ADMIN_SESSION_TTL: z.coerce.number().int().positive(),
    ADMIN_ACCESS_TOKEN_TTL: z.coerce.number().int().positive(),
  })
  .superRefine((config, context) => {
    if (config.ADMIN_ACCESS_TOKEN_TTL > config.ADMIN_SESSION_TTL) {
      context.addIssue({
        code: 'custom',
        path: ['ADMIN_ACCESS_TOKEN_TTL'],
        message: 'Access token TTL must not exceed session TTL',
      });
    }
  });

export const env = environmentSchema.parse({
  NODE_ENV: nodeEnvironment,
  PORT: process.env.PORT,
  MONGODB_URI: getRequiredEnv('MONGODB_URI'),
  REDIS_URL: getRequiredEnv('REDIS_URL'),
  REDIS_TEST_URL: process.env.REDIS_TEST_URL,
  JWT_ACCESS_SECRET: getRequiredEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getRequiredEnv('JWT_REFRESH_SECRET'),
  LOG_LEVEL: process.env.LOG_LEVEL,
  ADMIN_SESSION_TTL: getRequiredEnv('ADMIN_SESSION_TTL'),
  ADMIN_ACCESS_TOKEN_TTL: getRequiredEnv('ADMIN_ACCESS_TOKEN_TTL'),
});

export const adminAccessTokenTtlSeconds = env.ADMIN_ACCESS_TOKEN_TTL;
