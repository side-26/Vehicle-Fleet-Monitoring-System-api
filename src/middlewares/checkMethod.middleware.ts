import type { RequestHandler } from 'express';

import { STATUS_CODES } from '#/configs/constants';
import { setErrorResponse } from '#/utils/helpers';

export const supportedMethods = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
] as const;

export type SupportedMethod = (typeof supportedMethods)[number];

export const checkMethodMiddleware: RequestHandler = (request, _response, next) => {
  if (supportedMethods.some((method) => method === request.method)) {
    next();
    return;
  }

  setErrorResponse(STATUS_CODES.METHOD_NOT_ALLOWED, {
    isSuccess: false,
    status: STATUS_CODES.METHOD_NOT_ALLOWED,
    message: 'Method not allowed',
    data: { details: null, fieldMessage: null },
  });
};
