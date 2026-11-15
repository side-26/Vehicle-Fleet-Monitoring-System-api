# Repository Change Workflow

Use this workflow when implementing or modifying code in this repository.

## Repository structure and folder guides

- Every project folder must contain a file named `.Agents` that explains what the folder does and
  why it exists. Treat this as a folder-specific guide for agents.
- Whenever files in a folder or any of its descendants change, review and update that folder's
  `.Agents` file to reflect the current contents and responsibilities. Apply this recursively to
  every affected ancestor, so the documentation stays accurate across the full hierarchy.
- `src/configs/` holds application configuration files, including database configuration, constants,
  and other config files.
- `src/middlewares/` holds all application middleware.
- `src/infrastructures/` holds project infrastructure integrations and services, such as Redis.
- `src/modules/` holds project entities and their related implementation. Find an existing entity
  here before creating or modifying it; for example, user entity work belongs in this folder.
- `src/utils/` holds shared utilities used across the project, such as `helpers.ts`.
- `src/_types.ts` holds global types and interfaces.
- Keep these responsibilities in mind when choosing where new files belong. If the repository
  structure changes, update this workflow and the affected `.Agents` guides.
- Never use `console.log` to report developer or application diagnostics. Use the configured Pino
  logger from `src/configs/logger.config.ts` (or its designated runtime import) for log messages
  instead.

## 1. Understand the request

- Identify the requested behavior and the files or modules likely involved.
- Inspect nearby code, project configuration, and relevant agent skills before editing.
- Keep the change focused on the requested outcome and preserve existing conventions.

## 2. Plan the change

- Trace the relevant call paths and data types before changing interfaces.
- Note compatibility concerns, validation requirements, and affected areas.
- Prefer the smallest cohesive implementation that solves the request.

## 3. Implement

- Follow the TypeScript, lint, and formatting conventions configured in this project.
- Reuse existing utilities and patterns where appropriate.
- Update documentation or configuration when the behavior or setup changes.
- Avoid unrelated refactors and do not expose secrets or environment values.

## 4. Verify

- Run the checks appropriate to the change, such as `pnpm check`, `pnpm test`, or `pnpm build`.
- If a check cannot run, report the reason clearly.
- Review the final diff for accidental or unrelated edits.

## 5. Report

Summarize the implementation, list the checks that ran and their results, and call out any remaining
limitations.
