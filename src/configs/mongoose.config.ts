import mongoose from 'mongoose';

import { env } from '#src/configs/env.config';
import { appLogger } from '#src/configs/logger.config';

export const connectMongoose = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  await mongoose.connect(env.MONGODB_URI);
  appLogger.success('MongoDB connected successfully');

  return mongoose;
};

export const disconnectMongoose = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};
