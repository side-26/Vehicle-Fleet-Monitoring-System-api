# Health Checks Module

Provides `/health-checks/live`, `/health-checks/ready`, and `/health-checks/startup` probes, mounted
under `/api` by the application. Readiness reports MongoDB and Redis connection state; startup
remains unhealthy until startup is marked complete and dependencies are ready. Module unit and
integration tests live under `tests/` in this folder.
