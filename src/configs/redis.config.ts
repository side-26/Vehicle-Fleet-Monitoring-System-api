import { createClient } from 'redis';

import { env } from '#/configs/env.config';
import { logger } from '#/configs/logger.config';

export const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', (error: Error) => {
  logger.error({ err: error }, 'Redis client error');
});

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    return;
  }

  await redisClient.quit();
};
