# healthAlst Engineering Guide

## Architecture

- `server/` is one Spring Boot deployment organized as Spring Modulith bounded
  contexts under `org.i19n.healthalst.modules`.
- Each backend context uses `interfaces -> application -> domain`, with
  `infrastructure` implementing application or domain ports.
- `client/` is a pnpm/Turborepo workspace. Deployable Next.js applications live
  under `client/apps`; reusable code lives under `client/packages`.
- Frontend features live under each application's `src/modules`; route files in
  `app/` compose those features and do not contain business logic.
- PostgreSQL schema changes are append-only Flyway migrations.

Read `docs/engineering/architecture/modular-monolith.md` before changing a
boundary.

## Commands

- Install: `cd client && pnpm install --frozen-lockfile`
- Frontend checks: `cd client && pnpm lint && pnpm typecheck && pnpm test`
- Backend checks: `cd server && ./gradlew check`
- Backend development: `docker compose up -d postgres && cd server && ./gradlew bootRun`
- Frontend development: `cd client && pnpm dev`
- Full stack: `docker compose up --build`

## Rules

- Keep HTTP DTOs separate from persistence and domain types.
- Validate input at trust boundaries and enforce authorization on the server.
- Do not add cross-module repository access; use public facades or events.
- Never commit secrets. Update example environment files for new configuration.
- Add tests for behavior and module-boundary changes.

