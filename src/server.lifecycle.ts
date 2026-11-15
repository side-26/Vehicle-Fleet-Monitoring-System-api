import { createServer, type Server } from 'node:http';

import type { Express } from 'express';

import { SERVER_LIFECYCLE } from '#src/configs/constants';
import { env } from '#src/configs/env.config';
import { appLogger } from '#src/configs/logger.config';
import { disconnectMongoose } from '#src/configs/mongoose.config';
import { connectMongoose } from '#src/configs/mongoose.config';
import { connectRedis, disconnectRedis } from '#src/configs/redis.config';
import { markStartupComplete } from '#src/modules/healthChecks/healthChecks.service';

export type ShutdownReason = 'SIGTERM' | 'SIGINT' | 'uncaughtException' | 'unhandledRejection';

export interface ShutdownOptions {
  exitCode?: number;
  error?: Error;
}

export type ShutdownHandler = (reason: ShutdownReason, options?: ShutdownOptions) => Promise<void>;

export const startApplication = async (app: Express): Promise<Server> => {
  await connectMongoose();
  let server: Server | undefined;

  try {
    await connectRedis();
    server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server?.once('error', reject);
      server?.listen(env.PORT, () => {
        server?.off('error', reject);
        resolve();
      });
    });
    markStartupComplete();
    appLogger.success(`Server started on port ${env.PORT}`, { port: env.PORT });
    return server;
  } catch (error) {
    const cleanup = await Promise.allSettled([
      ...(server ? [closeHttpServer(server)] : []),
      disconnectMongoose(),
      disconnectRedis(),
    ]);
    const cleanupErrors = cleanup.flatMap((result) =>
      result.status === 'rejected' ? [result.reason] : [],
    );
    if (cleanupErrors.length > 0) {
      appLogger.error('Startup cleanup failed', new AggregateError(cleanupErrors));
    }
    throw error;
  }
};

const closeHttpServer = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeIdleConnections?.();
  });

const closeResources = async (server: Server): Promise<void> => {
  const results = await Promise.allSettled([
    closeHttpServer(server),
    disconnectMongoose(),
    disconnectRedis(),
  ]);
  const failures = results.flatMap((result) =>
    result.status === 'rejected' ? [result.reason] : [],
  );
  if (failures.length > 0) {
    throw new AggregateError(failures, 'One or more resources failed to close');
  }
};

export const createShutdownHandler = (server: Server): ShutdownHandler => {
  let shutdownPromise: Promise<void> | undefined;
  return (reason, { exitCode = 0, error } = {}) => {
    if (shutdownPromise) {
      appLogger.warn('Repeated shutdown request received', { reason });
      server.closeAllConnections?.();
      return shutdownPromise;
    }

    appLogger.warn('Graceful shutdown started', { reason });
    shutdownPromise = (async () => {
      let timeoutId: NodeJS.Timeout | undefined;
      try {
        const timeout = new Promise<never>((_resolve, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error('Shutdown timed out')),
            SERVER_LIFECYCLE.SHUTDOWN_TIMEOUT_MS,
          );
          timeoutId.unref();
        });
        await Promise.race([closeResources(server), timeout]);
        process.exitCode = exitCode;
        appLogger.info('Application stopped', { reason, uptime: process.uptime() });
      } catch (shutdownError) {
        appLogger.error('Forced shutdown', shutdownError instanceof Error ? shutdownError : error);
        server.closeAllConnections?.();
        process.exit(1);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    })();
    return shutdownPromise;
  };
};

export const registerProcessHandlers = (shutdown: ShutdownHandler): (() => void) => {
  const handlers = {
    SIGTERM: () => void shutdown('SIGTERM'),
    SIGINT: () => void shutdown('SIGINT'),
    uncaughtException: (error: Error) => {
      appLogger.error('Uncaught exception', error);
      void shutdown('uncaughtException', { exitCode: 1, error });
    },
    unhandledRejection: (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      appLogger.error('Unhandled rejection', error);
      void shutdown('unhandledRejection', { exitCode: 1, error });
    },
  };
  for (const [event, handler] of Object.entries(handlers)) {
    process.on(event, handler);
  }
  return () => {
    for (const [event, handler] of Object.entries(handlers)) {
      process.off(event, handler);
    }
  };
};
