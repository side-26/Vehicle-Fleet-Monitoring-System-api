export const healthStatuses = ['healthy', 'unhealthy'] as const;
type HealthStatus = (typeof healthStatuses)[number];

export interface HealthCheckResponse {
  status: HealthStatus;
  checks?: {
    mongodb: HealthStatus;
    redis: HealthStatus;
  };
}
