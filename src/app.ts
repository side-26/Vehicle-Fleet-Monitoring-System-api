import express from 'express';

import { scalarDocsMiddleware } from '#src/configs/scalar.config';
import { checkMethodMiddleware } from '#src/middlewares/checkMethod.middleware';
import { errorMiddleware } from '#src/middlewares/error.middleware';
import { headersMiddleware } from '#src/middlewares/headers.middleware';
import { loggerMiddleware } from '#src/middlewares/logger.middleware';
import { rateLimiterMiddleware } from '#src/middlewares/ratelimiter.middleware';
import { healthChecksRouter } from '#src/modules/healthChecks/healthChecks.routes';

export const app = express();

app.use(...headersMiddleware);
app.use(express.json());
app.use(loggerMiddleware);
app.use(checkMethodMiddleware);
app.use(rateLimiterMiddleware);

// #apis
app.use('/docs', scalarDocsMiddleware);
app.use('/api', healthChecksRouter);
// #apis-end

app.use(errorMiddleware);
