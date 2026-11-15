import pino, { type LoggerOptions } from 'pino';
import { pinoHttp } from 'pino-http';

import { STATUS_CODES } from '#/configs/constants';
import { env } from '#/configs/env.config';

const isDevelopment = env.NODE_ENV === 'development';

const loggerOptions = {
  level: env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
} satisfies LoggerOptions;

export const logger = pino(loggerOptions);

export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  customLogLevel: (_request, response, error) => {
    if (error || response.statusCode >= STATUS_CODES.INTERNAL_SERVER_ERROR) {
      return 'error';
    }

    if (
      response.statusCode >= STATUS_CODES.BAD_REQUEST &&
      response.statusCode < STATUS_CODES.INTERNAL_SERVER_ERROR
    ) {
      return 'warn';
    }

    return 'info';
  },
  customSuccessMessage: (_request, response) => {
    if (response.statusCode === STATUS_CODES.NO_CONTENT) {
      return 'request completed successfully';
    }

    return 'request completed successfully';
  },
});
