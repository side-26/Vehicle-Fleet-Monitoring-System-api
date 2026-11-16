import type { RequestHandler } from 'express';

import { STATUS_CODES } from '#src/configs/constants';
import { getReadiness, isStartupComplete } from '#src/modules/healthChecks/healthChecks.service';
import type { HealthCheckResponse } from '#src/modules/healthChecks/healthChecks.types';
import { setErrorResponse, setSuccessResponse } from '#src/utils/helpers';

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
    setErrorResponse(STATUS_CODES.SERVICE_UNAVAILABLE, {
      isSuccess: false,
      status: STATUS_CODES.SERVICE_UNAVAILABLE,
      message: 'Service is not ready',
      data: { details: body.checks, fieldMessage: null },
    });
  }
  setSuccessResponse(response, STATUS_CODES.OK, { isSuccess: true, message: null, data: body });
};

export const startupController: RequestHandler = (_request, response) => {
  const started = isStartupComplete();
  const body: HealthCheckResponse = { status: started ? 'healthy' : 'unhealthy' };
  if (!started) {
    setErrorResponse(STATUS_CODES.SERVICE_UNAVAILABLE, {
      isSuccess: false,
      status: STATUS_CODES.SERVICE_UNAVAILABLE,
      message: 'Application startup is incomplete',
      data: { details: null, fieldMessage: null },
    });
  }
  setSuccessResponse(response, STATUS_CODES.OK, { isSuccess: true, message: null, data: body });
};
