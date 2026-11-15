import { appLogger } from '#src/configs/logger.config';
import { connectMongoose, disconnectMongoose } from '#src/configs/mongoose.config';
import { connectRedis, disconnectRedis } from '#src/configs/redis.config';

export const startServices = async (): Promise<void> => {
  await Promise.all([connectMongoose(), connectRedis()]);
  appLogger.success('Application services connected');
};

export const closeServices = async (): Promise<void> => {
  const results = await Promise.allSettled([disconnectRedis(), disconnectMongoose()]);
  const failures = results.filter((result) => result.status === 'rejected');

  if (failures.length > 0) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      'One or more application services failed to close',
    );
  }

  appLogger.info('Application services disconnected');
};
