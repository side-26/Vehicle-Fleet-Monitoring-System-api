# Vehicle Fleet Monitoring System — API

Backend application for the Vehicle Fleet Monitoring System, designed to support vehicle tracking,
fleet management, driver management, and real-time telemetry.

## Technology Stack

- **Runtime:** Node.js 26
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Caching:** Redis
- **Validation:** Zod
- **Authentication:** JWT and bcrypt
- **Logging:** Pino
- **Testing:** Vitest and Supertest
- **Linting:** Oxlint
- **Formatting:** Oxfmt
- **Package Manager:** pnpm 12.18.0
- **Git Hooks:** Husky, lint-staged, and Commitlint

## Prerequisites

- Node.js 26.x
- pnpm 12.18.0
- Git

## Getting Started

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Configure environment variables:

```bash
cp .env.example .env.local
```

Update `.env.local` with your local environment configuration.

## Commit Convention

This project follows Conventional Commits with additional support for `hotfix` and `hotstyle`.

```text
feat: add new feature
fix: resolve a bug
refactor: improve existing implementation
docs: update documentation
test: add or update tests
chore: update project configuration
hotfix: resolve critical issue
hotstyle: resolve critical styling issue
```

## Project Status

Currently under development. Initial project infrastructure and development tooling are being
configured.
