import pino, { type LoggerOptions } from 'pino';
import { pinoHttp } from 'pino-http';

import { STATUS_CODES } from '#src/configs/constants';
import { env } from '#src/configs/env.config';

interface LogMetadata {
  [key: string]: unknown;
}

interface ApiRequestLike {
  id?: string | number;
  method?: string;
  url?: string;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponseLike {
  statusCode?: number;
}

interface ApiErrorLike {
  message?: string;
  code?: string;
  responseBody?: unknown;
}

const isProduction = env.NODE_ENV === 'production';

const loggerOptions = {
  level: env.LOG_LEVEL ?? 'info',
  base: undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.refreshToken',
      'body.password',
      'body.token',
      'body.refreshToken',
    ],
    censor: '***REDACTED***',
  },
  serializers: {
    req: (request: ApiRequestLike) => ({
      id: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers?.['user-agent'] ?? 'unknown',
    }),
    res: (response: ApiResponseLike) => ({ statusCode: response.statusCode }),
    err: (error: Error) => ({
      message: error.message,
      stack: error.stack,
      name: error.name,
    }),
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            singleLine: true,
            errorProps: '*',
          },
        },
      }),
  timestamp: pino.stdTimeFunctions.isoTime,
} satisfies LoggerOptions;

const logger = pino(loggerOptions);

export const apiLogger = {
  request: (request: ApiRequestLike, metadata: LogMetadata = {}): void => {
    logger.info({ type: 'API_REQUEST', req: request, metadata });
  },
  success: (
    request: ApiRequestLike,
    response: ApiResponseLike,
    duration: number,
    data: LogMetadata = {},
  ): void => {
    logger.info({
      type: 'API_SUCCESS',
      statusCode: response.statusCode,
      method: request.method,
      url: request.url,
      duration: `${duration}ms`,
      requestId: request.id,
      responseData: data,
    });
  },
  clientError: (
    request: ApiRequestLike,
    response: ApiResponseLike,
    duration: number,
    error: ApiErrorLike = {},
  ): void => {
    logger.warn({
      type: 'API_CLIENT_ERROR',
      statusCode: response.statusCode,
      method: request.method,
      url: request.url,
      duration: `${duration}ms`,
      error: { message: error.message, code: error.code },
      responseBody: error.responseBody,
    });
  },
  serverError: (
    error: Error,
    request: ApiRequestLike,
    response: ApiResponseLike,
    duration: number,
    metadata: LogMetadata = {},
  ): void => {
    logger.error(
      {
        type: 'API_SERVER_ERROR',
        statusCode: response.statusCode ?? STATUS_CODES.INTERNAL_SERVER_ERROR,
        method: request.method,
        url: request.url,
        duration: `${duration}ms`,
        err: error,
        metadata,
      },
      'API server error',
    );
  },
  error: (error: Error, request?: ApiRequestLike, metadata: LogMetadata = {}): void => {
    logger.error({
      type: 'API_ERROR',
      err: error,
      method: request?.method,
      url: request?.url,
      requestId: request?.id,
      metadata,
    });
  },
};

const appLogger = {
  info: (message: string, data: LogMetadata = {}): void => {
    logger.info({ type: 'APP_INFO', message, ...data });
  },
  success: (message: string, data: LogMetadata = {}): void => {
    logger.info({ type: 'APP_SUCCESS', message, ...data });
  },
  warn: (message: string, data: LogMetadata = {}): void => {
    logger.warn({ type: 'APP_WARN', message, ...data });
  },
  error: (message: string, error?: Error, data: LogMetadata = {}): void => {
    logger.error({ type: 'APP_ERROR', err: error, ...data }, message);
  },
  db: (operation: string, collection: string, data: LogMetadata = {}): void => {
    logger.debug({ type: 'DATABASE', operation, collection, ...data });
  },
  user: (action: string, userId: string, data: LogMetadata = {}): void => {
    logger.info({ type: 'USER_ACTION', action, userId, ...data });
  },
};

export { logger, appLogger };

export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  customLogLevel: (_request, response, error) => {
    if (error || response.statusCode >= STATUS_CODES.INTERNAL_SERVER_ERROR) return 'error';
    if (response.statusCode >= STATUS_CODES.BAD_REQUEST) return 'warn';
    return 'info';
  },
  customSuccessMessage: () => 'request completed successfully',
});
