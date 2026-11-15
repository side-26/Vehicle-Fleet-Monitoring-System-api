import type { RequestHandler } from 'express';

import { STATUS_CODES } from '#src/configs/constants';
import { setSuccessResponse } from '#src/utils/helpers';

import { getReadiness, isStartupComplete } from './healthChecks.service.js';

import type { HealthCheckResponse } from './healthChecks.types.js';

export const liveController: RequestHandler = (_request, response) => {
  const body: HealthCheckResponse = { status: 'healthy' };
  setSuccessResponse(response, STATUS_CODES.OK, { isSuccess: true, message: null, data: body });
};

export const readyController: RequestHandler = (_request, response) => {
  const checks = getReadiness();
  const ready = checks.mongodb && checks.redis;
  const body: HealthCheckResponse = {
    status: ready ? 'healthy' : 'unhealthy',
    checks: {
      mongodb: checks.mongodb ? 'healthy' : 'unhealthy',
      redis: checks.redis ? 'healthy' : 'unhealthy',
    },
  };
  if (!ready) {
    return;
  }
  setSuccessResponse(response, STATUS_CODES.OK, { isSuccess: true, message: null, data: body });
};

export const startupController: RequestHandler = (_request, response) => {
  const started = isStartupComplete();
  const body: HealthCheckResponse = { status: started ? 'healthy' : 'unhealthy' };
  if (!started) {
    return;
  }
  setSuccessResponse(response, STATUS_CODES.OK, { isSuccess: true, message: null, data: body });
};
