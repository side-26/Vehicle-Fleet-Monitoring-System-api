import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { STATUS_CODES } from '#src/configs/constants';

import { app } from '../../../../app.js';

describe('health check endpoints', () => {
  it('reports liveness', async () => {
    const response = await request(app).get('/api/health-checks/live');
    expect(response.status).toBe(STATUS_CODES.OK);
    expect(response.body.status).toBe('healthy');
  });

  it('reports dependency readiness and startup state', async () => {
    const readiness = await request(app).get('/api/health-checks/ready');
    expect([STATUS_CODES.OK, STATUS_CODES.SERVICE_UNAVAILABLE]).toContain(readiness.status);
    expect(readiness.body.checks).toEqual(
      expect.objectContaining({ mongodb: expect.any(String), redis: expect.any(String) }),
    );

    const startup = await request(app).get('/api/health-checks/startup');
    expect([STATUS_CODES.OK, STATUS_CODES.SERVICE_UNAVAILABLE]).toContain(startup.status);
  });
});
