# Atomic Session Scripts

These Lua scripts perform multi-key administrator session changes atomically on standalone Redis.
They run through the shared Redis client and must validate conditions before mutating keys because
Lua runtime errors do not undo prior writes.
