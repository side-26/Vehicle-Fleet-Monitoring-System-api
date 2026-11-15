# Module Workflow

Use this workflow whenever a prompt asks to create, update, or modify a project module/entity, such
as users or vehicles. Follow the repository change workflow and TypeScript workflow alongside these
module-specific rules.

## Locate and name a module

- Keep module/entity implementations under `src/modules/`.
- Use plural names for module directories and files: `users`, not `user`; `vehicles`, not `vehicle`.
- Before creating a module or file, inspect `src/modules/` for an existing implementation and extend
  it when appropriate. Preserve the established structure and naming conventions.
- Each module folder must have a `.Agents` guide describing its purpose and contents. When module
  files change, update `.Agents` guides for the module and affected ancestor folders according to
  the repository change workflow.

## Standard module files

Create the applicable files below, using the plural entity name as the filename prefix (for example,
`users.types.ts`). Do not add empty placeholder files for layers the module does not need; explain
any omitted layer when it matters to the requested feature.

- `[entityName].types.ts` — module type exports, including DTO types. Types for Zod-validated data
  must be derived from the schemas with `z.infer`, `z.input`, or `z.output` as appropriate. Avoid
  duplicating schema shapes by hand.
- `[entityName].validations.ts` — Zod schemas for all API-flow input and output data used by the
  module. Parse and validate untrusted request data at the boundary; use the schema-derived types in
  the rest of the module.
- `[entityName].controllers.ts` — all controller-layer handlers for the module. Handle HTTP
  request/response concerns here and delegate business rules to the service layer.
- `[entityName].routes.ts` — all route-layer definitions for the module, connecting paths,
  middleware/validation, and controller handlers.
- `[entityName].paths.ts` — module route path constants or definitions, kept consistent with the
  routes.
- `[entityName].service.ts` — the module's business logic and coordination with persistence or other
  services. Keep HTTP-specific concerns in controllers.
- `[entityName].helpers.ts` — shared helper functions specific to this module. Extract helpers when
  doing so removes meaningful duplication or clarifies business logic; do not create redundant
  wrappers for one-off operations.
- `[entityName].model.ts` — the persistence model and the collection/table/document design for the
  module's entity, using the project's configured data store and existing persistence conventions.

## Module implementation steps

### Routes and tests

- Prefix module endpoint paths with the module's plural kebab-case name, such as
  `/health-checks/live` or `/users/all`.
- Mount routers in `src/app.ts` under `/api`, such as `app.use('/api', healthChecksRouter)`. The
  resulting health endpoint is `/api/health-checks/live`.
- Keep unit and integration tests in the related module folder.
- Use `STATUS_CODES` constants in tests instead of numeric HTTP status literals.
- Send every success response through `setSuccessResponse` and raise every application error through
  `setErrorResponse`; do not write response bodies directly with `response.status(...).json(...)`.

1. Read the module's `.Agents` guide and inspect related modules, shared middleware, configuration,
   infrastructure, utilities, and global types.
2. Map the requested API flow and business behavior. Identify request inputs, response outputs,
   validation, authorization, persistence, and error handling.
3. Define or update Zod schemas in `[entityName].validations.ts`, then derive and export the
   corresponding DTO/input/output types in `[entityName].types.ts`.
4. Implement or update the model, service, controller, route paths, and routes according to their
   layer responsibilities. Keep business logic in services and avoid duplicating helpers.
5. Update module exports and any application route registration required by this repository's
   conventions.
6. Update relevant `.Agents` guides for all changed folders and ancestors, then review the diff and
   run appropriate checks.
