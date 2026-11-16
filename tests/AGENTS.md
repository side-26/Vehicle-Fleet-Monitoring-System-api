# Test Setup

This folder holds shared Vitest setup. `setup-env.ts` supplies harmless test-only environment values
before application modules load. Module-specific tests live alongside their implementation under
`src/modules/` or `src/infrastructures/`.
