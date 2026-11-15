import { describe, expect, it } from 'vitest';

import { healthStatuses } from '../../healthChecks.types.js';
import { healthCheckResponseSchema } from '../../healthChecks.validations.js';

describe('health check contracts', () => {
  it('accepts healthy response', () => {
    expect(healthCheckResponseSchema.parse({ status: 'healthy' }).status).toBe('healthy');
  });

  it('accepts readiness details and rejects unknown statuses', () => {
    expect(
      healthCheckResponseSchema.safeParse({
        status: 'unhealthy',
        checks: { mongodb: 'healthy', redis: 'unhealthy' },
      }).success,
    ).toBe(true);
    expect(healthStatuses).toContain('healthy');
    expect(healthCheckResponseSchema.safeParse({ status: 'unknown' }).success).toBe(false);
  });
});
