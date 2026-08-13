# healthAlst

healthAlst is a clean full-stack monorepo scaffold: a pnpm/Turborepo frontend
workspace alongside a Spring Boot modular monolith.

## Repository layout

```text
healthAlst/
├── client/
│   ├── apps/
│   │   └── image-rendering/  Next.js image-rendering application
│   └── packages/
│       ├── eslint-config/
│       ├── test-utils/
│       ├── typescript-config/
│       └── ui/
├── server/                   Spring Boot + Spring Modulith
│   └── src/main/java/org/i19n/healthalst/
│       ├── modules/          Bounded contexts
│       └── shared/           Cross-cutting technical code
├── docs/
└── compose.yml
```

The included `platform` slice proves the path from the image-rendering application
through the backend to PostgreSQL. It intentionally avoids inventing health
domain models before requirements exist.

## Start with Docker

```bash
cp .env.example .env
docker compose up --build
```

- Primary app: <http://localhost:3003>
- API status: <http://localhost:8080/api/v1/platform/status>
- API health: <http://localhost:8080/actuator/health>
- PostgreSQL: `localhost:5433`

## Develop locally

```bash
docker compose up -d postgres

cd server
./gradlew bootRun

cd ../client
corepack enable
pnpm install
pnpm dev
```

Use `cd client && pnpm lint && pnpm typecheck && pnpm test` and
`cd server && ./gradlew check` before submitting changes.
