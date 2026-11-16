# Redis Infrastructure

This folder contains Redis key definitions and administrator session persistence. It reuses the
single Redis client configured in `src/configs/redis.config.ts`.

- `redis.keys.ts` centralizes validated Redis key patterns.
- `session/` owns the administrator session schema, repository, and atomic Lua operations.

The Lua scripts assume a standalone Redis server. Redis Cluster would require hash tags that place
all keys involved in each script in the same slot, and bulk revocation would need a revised key
strategy.
