import mongoose from 'mongoose';

import { redisClient } from '#src/configs/redis.config';

export const isLive = (): boolean => true;

export const getReadiness = (): { mongodb: boolean; redis: boolean } => ({
  mongodb: mongoose.connection.readyState === 1,
  redis: redisClient.isReady,
});

export const isReady = (): boolean => {
  const checks = getReadiness();
  return checks.mongodb && checks.redis;
};

let startupComplete = false;

export const markStartupComplete = (): void => {
  startupComplete = true;
};

export const isStartupComplete = (): boolean => startupComplete && isReady();
