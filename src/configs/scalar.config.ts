import { apiReference } from '@scalar/express-api-reference';

import { openApiDocument } from '#src/docs/openapi';

export const scalarDocsMiddleware = apiReference({
  content: openApiDocument,
  theme: 'purple',
  darkMode: true,
  pageTitle: 'Vehicle Fleet Monitoring System API',
});
