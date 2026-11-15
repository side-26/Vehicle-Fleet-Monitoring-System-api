import mongoose from 'mongoose';

import { env } from '#/configs/env.config';

export const connectMongoose = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  await mongoose.connect(env.MONGODB_URI);

  return mongoose;
};

export const disconnectMongoose = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};
