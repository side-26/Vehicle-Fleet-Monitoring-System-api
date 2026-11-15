import { createClient } from 'redis';

import { env } from '#src/configs/env.config';
import { appLogger } from '#src/configs/logger.config';

export const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', (error: Error) => {
  appLogger.error('Redis client error', error);
});

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();
  appLogger.success('Redis connected successfully');
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    return;
  }

  await redisClient.quit();
};
