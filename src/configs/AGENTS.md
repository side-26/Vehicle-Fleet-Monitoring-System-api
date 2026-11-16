# Configurations

This folder contains application configuration modules, including database and infrastructure
connection settings. Configuration modules read environment values, validate required settings, and
expose typed setup functions or constants for the rest of the application.

- `env.config.ts` is the only module that reads `process.env`; it loads dotenv, defines and
  validates environment variables, and exports the typed `env` object. Other files must import from
  it instead of accessing `process.env` directly.
- `env.config.ts` is the single source for environment values, including administrator session and
  access-token lifetimes. Do not add separate files that re-export environment values.
- `mongoose.config.ts` validates `MONGODB_URI` and provides Mongoose connect and disconnect
  functions.
- `redis.config.ts` validates `REDIS_URL` and provides a Redis client with connect and disconnect
  functions.
- `constants.ts` exports shared configuration constants, including the `STATUS_CODES` HTTP status
  code map.
- `logger.config.ts` configures the shared Pino logger, Pino HTTP request logger, and
  development-only `pino-pretty` transport.

Update this guide when configuration files or their responsibilities change.
