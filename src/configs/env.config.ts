import dotenv from 'dotenv';

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

export const env = {
  NODE_ENV: nodeEnvironment,
  PORT: Number(process.env.PORT ?? 3000),
  MONGODB_URI: getRequiredEnv('MONGODB_URI'),
  REDIS_URL: getRequiredEnv('REDIS_URL'),
  JWT_ACCESS_SECRET: getRequiredEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getRequiredEnv('JWT_REFRESH_SECRET'),
  LOG_LEVEL: process.env.LOG_LEVEL,
};
