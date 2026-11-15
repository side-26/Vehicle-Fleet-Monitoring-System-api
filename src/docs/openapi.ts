export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Vehicle Fleet Monitoring System API',
    version: '1.0.0',
    description: 'API documentation for the Vehicle Fleet Monitoring System.',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/health-checks/live': {
      get: {
        summary: 'Liveness probe',
        description: 'Reports whether the API process is running.',
        responses: {
          '200': {
            description: 'The API process is alive.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/HealthCheckSuccess' } },
            },
          },
        },
      },
    },
    '/health-checks/ready': {
      get: {
        summary: 'Readiness probe',
        description: 'Reports whether MongoDB and Redis are ready.',
        responses: {
          '200': { description: 'The API is ready to receive requests.' },
          '503': { description: 'One or more dependencies are unavailable.' },
        },
      },
    },
    '/health-checks/startup': {
      get: {
        summary: 'Startup probe',
        description: 'Reports whether application startup completed.',
        responses: {
          '200': { description: 'Application startup completed.' },
          '503': { description: 'Application startup is incomplete.' },
        },
      },
    },
  },
  components: {
    schemas: {
      HealthCheckSuccess: {
        type: 'object',
        required: ['isSuccess', 'message', 'data'],
        properties: {
          isSuccess: { type: 'boolean', const: true },
          message: { type: 'string', nullable: true },
          data: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['healthy', 'unhealthy'] },
              checks: {
                type: 'object',
                properties: {
                  mongodb: { type: 'string', enum: ['healthy', 'unhealthy'] },
                  redis: { type: 'string', enum: ['healthy', 'unhealthy'] },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
