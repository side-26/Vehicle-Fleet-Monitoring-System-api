# Application Middleware

This folder contains Express middleware shared across application routes and requests.

- `logger.middleware.ts` exports the configured Pino HTTP request logger for Express middleware
  registration.
- `checkMethod.middleware.ts` rejects requests that use HTTP methods outside the supported method
  list with a typed 405 error.
- `headers.middleware.ts` applies Helmet security headers with a Content Security Policy for the API
  and Scalar CDN assets, plus CORS that allows localhost origin only outside production.
- `ratelimiter.middleware.ts` limits each client to 100 requests per 15-minute window and returns a
  typed 429 response.
- `error.middleware.ts` handles uncaught route errors and sends the standard typed error response.
  Request logging and status-based log levels are handled by `logger.middleware.ts`.

Update this guide when middleware files or responsibilities change.
