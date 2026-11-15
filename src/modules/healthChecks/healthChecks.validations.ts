import { z } from 'zod';

import { healthStatuses } from './healthChecks.types.js';

const healthStatusSchema = z.enum(healthStatuses);
export const healthCheckResponseSchema = z.object({
  status: healthStatusSchema,
  checks: z
    .object({
      mongodb: healthStatusSchema,
      redis: healthStatusSchema,
    })
    .optional(),
});
