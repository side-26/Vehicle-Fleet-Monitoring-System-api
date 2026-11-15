import { z } from 'zod';

import { healthStatuses } from './healthChecks.types.js';

export const healthStatusSchema = z.enum(healthStatuses);
export const healthCheckResponseSchema = z.object({
  status: healthStatusSchema,
  checks: z
    .object({
      mongodb: healthStatusSchema,
      redis: healthStatusSchema,
    })
    .optional(),
});
