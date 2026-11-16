# Administrator Sessions

This folder persists administrator sessions in Redis. Session records are JSON strings,
administrator indexes are sorted sets scored by absolute expiration time in milliseconds, and
consumed refresh hashes are expiring string markers.

`session.repository.ts` validates records read from Redis and uses Lua scripts in `scripts/` for
atomic creation, token rotation, individual revocation, and bulk revocation. Session TTL is fixed at
creation and never extended by rotation.
