# Vehicle Fleet Monitoring System API

This repository contains the Express and TypeScript backend for fleet monitoring. Project workflows
under `.agents/workflows/` define repository structure, TypeScript conventions, and module layout.
Source code lives in `src/`; shared Vitest setup lives in `tests/`; GitHub checks live in
`.github/workflows/`.

Redis administrator session persistence is in `src/infrastructures/redis/session/`. The API
currently has health-check routes and Scalar documentation. Update this guide when those top-level
responsibilities change.
