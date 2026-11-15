import { app } from '#src/app';
import { appLogger } from '#src/configs/logger.config';
import {
  createShutdownHandler,
  registerProcessHandlers,
  startApplication,
} from '#src/server.lifecycle';

const main = async (): Promise<void> => {
  const server = await startApplication(app);
  const shutdown = createShutdownHandler(server);
  registerProcessHandlers(shutdown);
};

main().catch((error: unknown) => {
  appLogger.error(
    'Application failed to start',
    error instanceof Error ? error : new Error(String(error)),
  );
  process.exitCode = 1;
});
