# Modular monolith architecture

healthAlst uses a pnpm frontend workspace beside a layered Spring Boot modular
monolith, with one deployable image-rendering application and shared packages.

## Backend

Each direct package under `server/src/main/java/org/i19n/healthalst/modules` is
a Spring Modulith application module. Within a module:

```text
<module>/
├── interfaces/       HTTP and message adapters; transport DTOs
├── application/      Use cases, transactions, commands, and ports
├── domain/           Entities, value objects, policies, and events
└── infrastructure/   Persistence and external-system adapters
```

Dependencies point inward. Infrastructure implements ports owned by the
application or domain. Modules communicate through public root-package facades
or application events, never by reaching into another module's internals or
tables. `ApplicationModulesTest` verifies these boundaries.

## Frontend

`client/apps/image-rendering` contains the deployable Next.js application.
Application routes stay thin; feature code belongs in `src/modules`, generic
runtime code in `src/lib`, and reusable presentation in `client/packages/ui`.

## Data and contracts

PostgreSQL is the durable source of truth. Every schema change is a new Flyway
migration. HTTP contracts are versioned under `/api/v1`; DTOs do not expose
persistence types. Authentication, tenancy, and health-data modules must not be
added until their authorization, privacy, retention, and audit requirements are
defined.
