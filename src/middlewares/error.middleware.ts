import type { ErrorRequestHandler } from 'express';

import type { ErrorResponse } from '#src/_types';
import { STATUS_CODES } from '#src/configs/constants';

const isErrorResponseData = (value: unknown): value is ErrorResponse['data'] => {
  if (typeof value !== 'object' || value === null || !('details' in value)) {
    return false;
  }

  if (!('fieldMessage' in value) || value.fieldMessage === null) {
    return 'fieldMessage' in value;
  }

  return (
    Array.isArray(value.fieldMessage) &&
    value.fieldMessage.every(
      (fieldError: unknown) =>
        typeof fieldError === 'object' &&
        fieldError !== null &&
        'name' in fieldError &&
        typeof fieldError.name === 'string' &&
        'message' in fieldError &&
        typeof fieldError.message === 'string',
    )
  );
};

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const applicationError = error instanceof Error ? error : new Error('Internal server error');
  const statusCode =
    'statusCode' in applicationError && typeof applicationError.statusCode === 'number'
      ? applicationError.statusCode
      : 'status' in applicationError && typeof applicationError.status === 'number'
        ? applicationError.status
        : STATUS_CODES.INTERNAL_SERVER_ERROR;
  const data =
    'data' in applicationError && isErrorResponseData(applicationError.data)
      ? applicationError.data
      : { details: null, fieldMessage: null };

  const errorResponse: ErrorResponse = {
    isSuccess: false,
    status: statusCode,
    message:
      statusCode >= STATUS_CODES.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : applicationError.message,
    data,
  };

  response.status(statusCode).type('application/json; charset=utf-8').json(errorResponse);
};
