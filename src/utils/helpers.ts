import type { Response } from 'express';

import type { ErrorResponse, SuccessResponse } from '#src/_types';
import { STATUS_CODES } from '#src/configs/constants';

export const setErrorResponse = (
  statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR,
  options: ErrorResponse = {
    isSuccess: false,
    status: statusCode,
    message: 'Internal server error',
    data: { details: null, fieldMessage: null },
  },
): never => {
  const error = new Error(options.message ?? 'Internal server error');
  Object.assign(error, { ...options, statusCode });

  throw error;
};

export const setSuccessResponse = <TData>(
  response: Response,
  statusCode: number,
  options: SuccessResponse<TData>,
): void => {
  response.status(statusCode).type('application/json; charset=utf-8').json(options);
};
