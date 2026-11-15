import { Router } from 'express';

import { liveController, readyController, startupController } from './healthChecks.controllers.js';
import { healthCheckPaths } from './healthChecks.paths.js';

export const healthChecksRouter = Router();

healthChecksRouter.get(healthCheckPaths.live, liveController);
healthChecksRouter.get(healthCheckPaths.ready, readyController);
healthChecksRouter.get(healthCheckPaths.startup, startupController);
