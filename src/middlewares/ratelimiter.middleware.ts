import { rateLimit } from 'express-rate-limit';

import type { ErrorResponse } from '#src/_types';
import { STATUS_CODES } from '#src/configs/constants';

export const rateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS,
  handler: (_request, response, _next, options) => {
    const errorResponse: ErrorResponse = {
      isSuccess: false,
      status: options.statusCode,
      message: 'Too many requests. Please try again later.',
      data: { details: null, fieldMessage: null },
    };

    response.status(options.statusCode).type('application/json; charset=utf-8').json(errorResponse);
  },
});
