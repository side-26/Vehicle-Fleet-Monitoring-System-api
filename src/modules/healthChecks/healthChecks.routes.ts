import { Router } from 'express';

import {
  liveController,
  readyController,
  startupController,
} from '#src/modules/healthChecks/healthChecks.controllers';
import { healthCheckPaths } from '#src/modules/healthChecks/healthChecks.paths';

export const healthChecksRouter = Router();

healthChecksRouter.get(healthCheckPaths.live, liveController);
healthChecksRouter.get(healthCheckPaths.ready, readyController);
healthChecksRouter.get(healthCheckPaths.startup, startupController);
