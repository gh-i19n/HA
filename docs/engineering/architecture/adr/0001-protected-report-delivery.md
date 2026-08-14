# ADR 0001: Protected report-delivery architecture

- Status: Proposed
- Date: 2026-08-13
- Decision owners: Architect, security/privacy engineer, database engineer
- Requirements: `docs/sdlc/02-requirements.md`
- Architecture baseline: `docs/sdlc/04-architecture.md`

## Context

healthAlst must let authorized clinic staff attach, publish, correct, and
withdraw clinically final PDF reports while letting only the correctly linked
patient access the current available version. Wrong-booking association,
cross-tenant or cross-patient disclosure, malicious files, silent overwrite,
and false completion are release-blocking risks.

The repository currently provides a Next.js application, a Java 21 Spring Boot
and Spring Modulith backend, PostgreSQL/Flyway, and a platform-status vertical
slice. It does not yet contain health-domain or production identity/storage
implementation. The approved requirements call for an external authoritative
booking source, OIDC identity, private object storage, malware scanning,
immutable versions, accountable audit, durable events, 99.9% availability,
RPO <= 15 minutes, and RTO <= 4 hours.

Provider, region, booking-contract, identity-policy, retention, PDF
accessibility, and representative capacity evidence are not yet approved.

## Decision

1. Preserve one Spring Modulith modular monolith and one Next.js web
   application for the first release. Backend modules are `access`, `bookings`,
   `reports`, `audit`, `privacy`, and `platform`; they collaborate only through
   public facades and versioned events.
2. Use a same-origin web architecture. Spring Security handles the approved
   OIDC authorization-code flow, opaque server session, CSRF, MFA/step-up claim
   enforcement, internal grant resolution, and object/state authorization.
   Next.js renders and proxies but does not assert ownership or authority.
3. Use PostgreSQL for transactional domain metadata, immutable audit evidence,
   idempotency, and a transactional outbox. Use private object storage for PDF
   bytes in separate quarantine and clean namespaces. Do not store PDFs in the
   relational database or a shared filesystem.
4. Maintain a tenant-scoped, versioned projection of the authoritative booking
   source. Reject/quarantine ambiguous, stale, or conflicting ownership data
   and reconcile from durable checkpoints.
5. Process upload and scanning as a durable saga. No patient visibility is
   possible until validation and malware scanning succeed and a clean immutable
   pending version is committed.
6. Make publication, correction/supersession, and withdrawal PostgreSQL
   transactions protected by idempotency, ETags, an aggregate row lock, a
   partial unique current-version constraint, required audit append, and outbox
   append.
7. Deliver content through a freshly authorized backend-mediated stream from
   private storage. Do not issue reusable public URLs or use a content CDN in
   the first release.
8. Enforce tenant isolation with scoped application repositories, composite
   tenant foreign keys, PostgreSQL row-level security, and separate runtime,
   migration, background, and controlled-maintenance roles.
9. Run asynchronous scan/outbox/reconciliation workers within the monolith
   initially. Preserve an adapter boundary for a broker if measured throughput
   or availability later requires one.

## Alternatives considered

### Microservices

Independent services could scale or deploy separately, but current scale and
team evidence do not justify the additional network authorization, distributed
transactions, message compatibility, observability, and incident surface. The
modular monolith preserves explicit boundaries while supporting atomic report,
audit, and outbox writes.

### Live booking lookup without a local projection

This avoids duplicated data but makes every search/upload/publication depend on
upstream latency and availability, complicates stable pagination, and cannot
reconcile missed or out-of-order events. A minimal provenance-bearing
projection is preferred.

### PostgreSQL BLOB or local filesystem storage

Database BLOBs couple large-object bandwidth and backup growth to transactional
metadata. Local files are unsafe across multiple instances and deployments.
Private object storage provides a better security, integrity, lifecycle, and
recovery boundary while PostgreSQL keeps authoritative object metadata.

### Direct presigned URLs or a CDN

They reduce application bandwidth but make per-request state/step-up checks,
immediate withdrawal, cache control, and access evidence harder. They are
deferred unless a later measured need produces a revocable design with equal
authorization guarantees.

### Synchronous scanning or broker-first processing

Synchronous scanning keeps requests open across an unreliable dependency and
does not remove cross-store failure. A broker-first design introduces another
durable system but still needs transactional publication. Durable PostgreSQL
saga/outbox state with in-process workers is the smallest reliable first step.

### Application-only tenancy checks or database per tenant

Application-only checks leave one coding error between users and cross-tenant
data. A database per clinic increases migration, backup, connection, reporting,
and operational complexity at unknown scale. Composite tenant constraints and
RLS provide proportionate defense in depth in the shared database.

## Consequences

Positive consequences:

- domain mutations, audit, and event intent can commit atomically;
- no hidden report state or storage URL needs to reach the patient browser;
- failures and retries have durable, reconcilable states;
- the existing stack and structural test remain useful; and
- future services or a broker can be extracted behind existing module ports if
  evidence justifies the cost.

Costs and risks:

- the Spring application carries PDF streaming bandwidth and worker load;
- object storage plus PostgreSQL requires saga compensation and inventory
  reconciliation;
- RLS and PostgreSQL-specific constraints require real PostgreSQL integration
  tests rather than relying on the current H2 profile;
- a local booking projection requires freshness policy and reconciliation;
- an in-flight response cannot retract bytes already delivered before a
  withdrawal; the active-stream target requires explicit approval; and
- provider and legal/policy decisions remain blockers rather than being solved
  by this ADR.

## Delivery and validation

The smallest risk-validating slice uses generated data and non-production
providers to prove OIDC identity, two-tenant isolation, booking projection, PDF
quarantine/scan, pending publication, owning-patient list/content access,
withdrawal, audit/outbox atomicity, and reconciliation.

Required evidence includes Spring Modulith verification; OpenAPI provider and
consumer tests; PostgreSQL migration, RLS, constraint, concurrency and query
plan tests; object/scanner malicious-file and integrity tests; a complete
actor/object/state/action matrix; browser header/network/accessibility tests;
failure injection; backup/restore; and security/privacy review.

Application rollback is allowed only while database and event contracts remain
compatible. Schema changes roll forward. A feature shutdown must preserve
objects, audit, outbox and reconciliation state and must never restore access to
a withdrawn or superseded report.

This ADR becomes Accepted only when the architecture gate is approved by its
accountable approver. Provider selection, legal/privacy policy, clinical PDF
policy, and production deployment remain separately approved decisions.
