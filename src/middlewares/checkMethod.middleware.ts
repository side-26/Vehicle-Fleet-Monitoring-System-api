import type { RequestHandler } from 'express';

import { HTTP_METHODS, STATUS_CODES } from '#/configs/constants';
import { setErrorResponse } from '#/utils/helpers';

export type SupportedMethod = (typeof HTTP_METHODS)[number];

export const checkMethodMiddleware: RequestHandler = (request, _response, next) => {
  if (HTTP_METHODS.some((method) => method === request.method)) {
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
