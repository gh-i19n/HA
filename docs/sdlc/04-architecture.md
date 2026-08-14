---
sdlc_gate: architecture
status: complete
---

# Architecture Baseline

## Cycle 3 Eventorch adaptation decision

This section supersedes earlier PDF-only, upstream-authoring-only, and
notification exclusions. The implementation source is Eventorch's existing
modular Spring/Next.js code, adapted at the domain boundary rather than copied
as event-management concepts.

### Module and ownership map

| HealthAlst module | Eventorch implementation adapted | Owned model |
| --- | --- | --- |
| `access` | identity registration, authentication tokens, organization memberships, member/profile/preference services, repositories, security and tenant filter | global user, refresh token, clinic organization, membership, invitation, profile and active clinic context |
| `reports` | document renderer abstraction, PDFBox renderer, POI DOCX renderer, authorized inline document response | booking-bound immutable report/version, structured clinical document, template/version and binary rendition |
| `notifications` | durable user notification repository/service, after-commit realtime signal, SSE emitter registry and notification endpoints | tenant-and-recipient-scoped notification, read state and safe resource reference |
| frontend app shell | Eventorch `DesignShell`, `EventSidebar`, `UserMenu`, settings layout, notification bell/stream and document viewer | permission-filtered HealthAlst navigation and complete staff/patient journeys |
| `@healthalst/ui` | Eventorch UI package primitives and composed dashboard/account controls | reusable, domain-neutral widgets with props/slots; no clinic, user, route, metric or report fixture embedded in primitives |

Users are global identities. Clinics are tenants. `organization_memberships`
provides a many-to-many association with `OWNER`, `ADMIN`, or `REPORT_STAFF`
and `ACTIVE`/`SUSPENDED` status. Patient is an account type, not a clinic
membership role. Registration either creates a patient account, atomically
creates a clinic plus owner membership, or accepts a clinic invitation. It can
never self-assign privilege in an existing clinic. A multi-membership staff
session is pinned to one active clinic; switching rotates the refresh token and
creates a new access context.

The Eventorch access/refresh JWT design is reused behind the Next.js BFF, with
these required corrections: distinct access and refresh token type/audience,
hashed and pessimistically locked one-time refresh rotation, normalized-email
uniqueness, collision-safe clinic slugs, database-backed active-membership
checks for every staff operation, and immediate refresh-token revocation on
membership suspension/removal. Tokens remain in secure HttpOnly BFF cookies;
application JavaScript receives session context, not reusable credentials.

All report repositories require tenant/recipient predicates in their method
contracts. Booking and report rows gain `organization_id`; composite unique and
foreign-key constraints prevent cross-tenant relationships. Staff endpoints
derive the organization from the authenticated context. Patient endpoints use
the authenticated user link. No service-layer SQL is permitted: migrations own
DDL and Spring Data JPA repositories own persistence/query specifications.

Structured reports use an explicit canonical model and versioned template
schema, not Eventorch's generic JSON walker as a clinical schema. The first
templates are `CHEST_XRAY` and `MRI_BRAIN`. Canonical sections include clinic
identity, patient/booking/exam context, indication, technique, comparison,
findings, impression, reporting professional and finalization metadata. One
immutable canonical version renders through adapted `DocumentRenderer`
implementations to PDF and DOCX. Original uploaded PDFs remain immutable.
Preview streams an authorized PDF with `inline`; download streams an explicit
PDF or DOCX rendition with `attachment`. Both re-authorize and audit at access
time.

Committed report and membership actions persist recipient notifications in the
same transaction and publish a transport-neutral realtime signal. An
`AFTER_COMMIT` listener fans out only to emitter keys `(organizationId,
recipientId)`. SSE carries topic and opaque resource ID only, never clinical
content. The durable REST inbox is authoritative; SSE only invalidates/refetches
queries. Heartbeats, reconnect, polling fallback and emitter cleanup follow
Eventorch. The BFF exposes a same-origin cookie-authenticated stream, avoiding
bearer tokens in query strings. A single-node in-memory registry is acceptable
for the interview runtime; a shared broker is the documented horizontal-scale
replacement.

### Cycle 3 HTTP contract groups

- `/api/v1/auth`: register patient, register clinic, login, refresh, logout,
  session context and active-clinic switch;
- `/api/v1/organizations`: current clinic, memberships, invitations, members,
  roles and clinic settings;
- `/api/v1/profile`, `/api/v1/settings/notifications`,
  `/api/v1/settings/sessions`: account settings;
- `/api/v1/notifications` and `/api/v1/notifications/stream`: durable inbox,
  read mutations and authenticated SSE;
- `/api/v1/staff/report-templates`, `/api/v1/staff/reports` and report-specific
  preview/export routes: structured authoring and staff access;
- `/api/v1/patient/reports/{id}/preview` and `/exports/{format}`: patient
  preview and format-specific download.

Every mutation validates DTOs at the controller boundary, uses an application
service transaction, calls a JPA repository, returns the shared problem/error
envelope, and emits notifications only after durable commit.

## Status, scope, and evidence boundary

This document proposes the production architecture for the approved healthAlst
requirements. It describes a real health product and real production-data
controls. It does not claim that the proposed modules, integrations, security
controls, infrastructure, tests, or operations have been implemented or
verified.

Evidence used:

- approved cycle-2 discovery and requirements in `docs/sdlc/`;
- the accepted experience direction in `docs/sdlc/03-experience-design.md`,
  whose validation gap was explicitly waived to permit architecture work;
- the observed repository, manifests, configuration, tests, migration, and
  `docs/engineering/architecture/modular-monolith.md`; and
- the decisions, alternatives, risks, and open approvals recorded below.

Observed facts are separated from proposed decisions. The repository currently
contains one Next.js application, a Spring Boot/Spring Modulith backend, one
PostgreSQL baseline table, and a platform-status slice. It has no implemented
identity, tenant, booking, report, object-storage, scanner, audit, privacy, or
production deployment capability.

## Outcomes, constraints, and non-goals

The architecture must make the following outcomes enforceable:

1. report content is associated with the correct authoritative booking;
2. clinic and patient isolation is enforced before lookup, counts, caching, or
   content delivery;
3. publication, correction, supersession, and withdrawal are atomic,
   immutable, concurrency-safe, and auditable;
4. unsafe files never become patient-accessible;
5. dependency failure produces no false success or broader visibility; and
6. the service can meet the approved 99.9% objective, RPO of at most 15 minutes,
   and RTO of at most four hours once the deployment is funded and verified.

Constraints include the existing Java 21/Spring Boot modular monolith,
Next.js/React frontend, PostgreSQL/Flyway persistence, one first-release web
application, a 20 MiB PDF limit, an authoritative external booking source, and
unselected production identity, storage, scanner, hosting, and telemetry
providers.

The first release does not author clinical reports, store or display DICOM
images, create bookings, provide diagnostic advice, support delegated access,
or claim FHIR/DICOM conformance. Microservices, a public content CDN, direct
public object URLs, and routine operator access to clinical content are also
out of scope.

## System context and deployment boundaries

### Proposed production context

```text
Staff/patient browser
        |
        | HTTPS, same origin, secure session and CSRF controls
        v
Next.js web application / thin BFF
        |
        | private HTTPS, forwards session and correlation context
        v
Spring Boot modular monolith --------------------> OIDC identity provider
        |          |             |                 (authentication/MFA)
        |          |             +---------------> authoritative booking API/events
        |          +-----------------------------> malware scanner
        |
        +---- PostgreSQL (metadata, policy state, audit, outbox)
        +---- private object storage (quarantine and clean PDF objects)
        +---- telemetry exporter / alerting platform (metadata only)
```

The browser uses one application origin. Next.js owns rendering and a narrow
backend-for-frontend proxy; it is not an authorization authority and does not
persist health data. Spring Security owns the OIDC login callback, server-side
session, CSRF validation, step-up/MFA claim enforcement, internal principal
resolution, and every role/object/state authorization decision. Production
CORS is disabled unless a separately approved consumer requires it; local CORS
remains an environment-specific development aid.

The first deployment remains a modular monolith with independently scalable
stateless Next.js and Spring Boot instances. PostgreSQL, object storage, the
identity provider, booking source, scanner, key provider, and telemetry service
are managed dependencies selected later under DEC-001, DEC-002, DEC-003,
DEC-004, and DEC-007. Development, test, staging, and production use distinct
accounts, credentials, databases, buckets, keys, identity clients, and
telemetry destinations.

### Trust boundaries

- The browser and all request data are untrusted.
- The Next.js server may relay authenticated requests but cannot assert tenant,
  patient, booking, report, role, or lifecycle ownership.
- The Spring application accepts identity only from the configured OIDC/session
  chain, then resolves current internal grants and links on every protected
  request.
- PostgreSQL and object storage are separate durable systems; no distributed
  transaction is assumed between them.
- Booking messages, scanner results, object metadata, filenames, and telemetry
  are untrusted inputs and are validated at their adapters.
- Operators, support personnel, batch jobs, and integrations use separate named
  service identities and least-privilege policies. No default break-glass or
  impersonation path exists.

## Module boundaries and ownership

Each backend module follows the repository's `interfaces`, `application`,
`domain`, and `infrastructure` layers. Modules expose root-package facades and
versioned application events only; they do not import another module's internal
packages, repositories, entities, or tables.

| Module     | Owns                                                                                                                                | Public collaboration                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `access`   | internal principals, clinic memberships, report permissions, patient-record links, revocation state, privacy-notice acknowledgement | current actor/context query; tenant/patient authorization decisions; access-change events |
| `bookings` | local booking projection, source provenance/version, eligibility mapping, sync cursor, reconciliation exceptions                    | tenant-scoped booking lookup and eligibility facade; booking projection events            |
| `reports`  | report aggregate, immutable versions, lifecycle state, upload attempts, content-object metadata, content access grants              | report commands/queries; scan and lifecycle events                                        |
| `audit`    | append-only accountable access and mutation evidence, integrity verification, purpose-scoped audit queries                          | in-transaction evidence append facade; restricted audit query/export                      |
| `privacy`  | requests, decisions, deadlines, retention-policy versions, holds, disposition jobs and evidence                                     | request workflow and retention/hold decisions                                             |
| `platform` | dependency health, readiness, correlation infrastructure, scheduled reconciliation coordination                                     | safe health/readiness contract and operational triggers                                   |
| `shared`   | transport/problem details, clocks, opaque identifiers, transaction and telemetry primitives only                                    | technical primitives; no health-domain state                                              |

`reports` asks `bookings` whether a booking is currently eligible and derives
tenant/patient ownership from that returned record. It never accepts ownership
fields from the upload client. `access` evaluates whether the current actor may
perform the requested action. `audit` participates in the same PostgreSQL
transaction for mutations that require evidence. `privacy` orchestrates
approved disposition through public module commands rather than modifying
foreign tables.

Frontend feature modules mirror user journeys rather than backend entities:
`auth`, `clinic-reports`, `patient-reports`, `team-access`, `privacy-requests`,
and `support`. Route files remain thin. Generic accessible primitives stay in
`@healthalst/ui`; role-specific commands and patient/staff data models must not
be placed in the shared UI package.

## Source-of-truth and data lifecycle

| State                                                        | Authoritative owner                                                 | healthAlst responsibility                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| authentication, credential, MFA and upstream account status  | approved OIDC identity provider                                     | server session, verified subject mapping, current claim checks and revocation response                        |
| clinic legal identity and staff authority                    | approved clinic/controller process                                  | tenant record, least-privilege memberships and immutable change evidence                                      |
| patient identity proof and clinic patient-record association | approved clinic identity/linking process                            | verified link decision, provenance, ambiguity/revocation state; never automatic on contact/booking data alone |
| booking and clinical completion state                        | one approved clinic booking source                                  | tenant-scoped projection, source version/provenance, eligibility mapping and reconciliation                   |
| report lifecycle and current visible version                 | `reports` module in PostgreSQL                                      | authoritative immutable version and visibility state                                                          |
| PDF bytes                                                    | private object storage paired with PostgreSQL checksum/key metadata | quarantine, scan, clean-object promotion, authorized streaming and disposition                                |
| scanner verdict                                              | approved scanner, recorded by `reports`                             | authenticated/idempotent result ingestion and durable verdict/history                                         |
| lifecycle/access evidence                                    | `audit` module in PostgreSQL                                        | append-only, purpose-limited evidence without report narrative                                                |
| retention/hold/request decisions                             | controller-approved policy represented by `privacy`                 | versioned policy execution and proof; no invented retention duration                                          |

The report aggregate is permanently bound to one tenant, booking, and patient
link. A version number is monotonic within a report. Content metadata and bytes
are immutable after validation. Lifecycle transitions are explicit:

```text
UPLOADING -> SCANNING -> PENDING -> AVAILABLE -> SUPERSEDED
     |           |          |          |
     +-> FAILED  +-> QUARANTINED        +-> WITHDRAWN
                 +-> REJECTED
```

Only `PENDING -> AVAILABLE`, `AVAILABLE -> SUPERSEDED`, and
`AVAILABLE -> WITHDRAWN` are user-driven first-release transitions. Publishing
a correction changes the prior available version to `SUPERSEDED` and the new
pending version to `AVAILABLE` in one transaction. A failed correction never
changes the prior available version. Patients can query only the one current
`AVAILABLE` version; all other states are absent from rows, totals, object
responses, and content delivery.

## HTTP contract baseline

### Contract rules

- Contracts are JSON under `/api/v1`, except multipart upload and PDF streaming.
- DTOs use opaque UUIDs, ISO-8601 UTC instants, explicit enums, and documented
  nullability; persistence entities are never serialized.
- Staff routes resolve one active tenant from the server session and internal
  membership. Patient routes resolve the verified patient-account links. A
  request body or query cannot broaden either scope.
- Lists use cursor pagination with a stable `(relevant_time DESC, id DESC)`
  order, `limit` default 25 and maximum 50. Filters are allow-listed. Cursors
  are opaque, signed, scope/query-bound, and expire; totals are returned only
  when the tenant/patient predicate is already applied.
- State-changing requests require `Idempotency-Key`. Commands against an
  existing aggregate also require `If-Match`; responses return an opaque ETag
  derived from the aggregate concurrency version.
- Idempotency keys are scoped to actor, tenant/patient context, operation, and
  normalized request hash. A matching retry returns the original status/body;
  a reused key with different input returns conflict. Initial retention is 24
  hours and must be checked against workflow retry needs during delivery.
- Problem responses use `application/problem+json` with stable `type`, `title`,
  `status`, safe `detail`, `instance`, `code`, field errors where authorized,
  and a non-PHI correlation identifier.
- Cross-tenant, cross-patient, hidden-state, and unknown-object requests return
  the same approved not-found response. An authorized stale transition returns
  `409` or `412`; it never masks a scope denial.
- Rate limits are keyed by safe actor/session/tenant and network-risk signals;
  `429` includes a bounded `Retry-After`. Report content and patient search data
  are excluded from URLs, analytics, and telemetry.

### Proposed first-release resources

| Actor/use case             | Method and path                                              | Success and important controls                                                                                                |
| -------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| current context            | `GET /api/v1/session/context`                                | minimum actor, roles, active clinic and reauthentication state; no token material                                             |
| clinic booking search      | `GET /api/v1/staff/bookings`                                 | eligible tenant projection only; cursor/filter contract; no live-source fallback that can bypass reconciliation               |
| clinic report queue        | `GET /api/v1/staff/reports`                                  | tenant predicate before filter/count; summaries only                                                                          |
| report detail/history      | `GET /api/v1/staff/reports/{reportId}`                       | purpose/role checked; content not embedded                                                                                    |
| upload first version       | `POST /api/v1/staff/bookings/{bookingId}/report-versions`    | multipart PDF; 20 MiB server limit; idempotency and booking precondition; `202 Accepted` while scanning                       |
| upload correction          | `POST /api/v1/staff/reports/{reportId}/versions`             | multipart PDF plus allow-listed correction reason; server derives booking/ownership; idempotency + `If-Match`; `202 Accepted` |
| publish pending version    | `POST /api/v1/staff/report-versions/{versionId}/publication` | idempotency + `If-Match`; atomic audit/outbox; `200` on completed retry                                                       |
| withdraw available version | `POST /api/v1/staff/report-versions/{versionId}/withdrawal`  | allow-listed reason plus confirmation; idempotency + `If-Match`; no clinical narrative in audit                               |
| patient report list        | `GET /api/v1/patient/reports`                                | current available summaries for verified links only; neutral empty state                                                      |
| patient report context     | `GET /api/v1/patient/reports/{reportId}`                     | fresh ownership/state check; current available metadata only                                                                  |
| patient content            | `GET /api/v1/patient/report-versions/{versionId}/content`    | fresh step-up/session/link/state decision and durable access evidence before server-mediated stream                           |
| team access                | `/api/v1/staff-access/...`                                   | tenant-admin role only; report-content permission remains separate                                                            |
| privacy requests           | `/api/v1/privacy-requests/...`                               | verified subject/operator paths, state machine, dual approval where policy requires                                           |

OpenAPI becomes the machine-readable contract during implementation. Provider
tests validate authorization, input, problem types, ETags/idempotency and
failure paths; generated TypeScript types or a checked adapter prevent the
frontend from maintaining a divergent handwritten contract.

### Error and retry semantics

| Condition                                      | External behavior                                      | Retry/recovery                                                           |
| ---------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| unauthenticated/expired session                | `401`, generic reauthentication path                   | reauthenticate; do not replay a file silently                            |
| authenticated but action disallowed            | `403` only when object/context is already safely known | request authorized role or use safe support route                        |
| absent or hidden object/state                  | uniform `404`                                          | refresh authorized list; no existence hint                               |
| invalid fields/filter/type                     | `400`/`422` with safe field errors                     | correct input                                                            |
| upload exceeds configured limit                | `413` before persistence where possible                | select compliant PDF                                                     |
| missing/stale precondition                     | `428`/`412`                                            | refetch context; deliberate retry                                        |
| lifecycle or idempotency conflict              | `409` with stable code                                 | inspect current durable state                                            |
| scanner/storage/booking dependency unavailable | `503`; no false success                                | bounded exponential retry or durable queued state where already accepted |
| rate limited                                   | `429` and `Retry-After`                                | wait; support recovery remains separately protected                      |

### Booking and event contracts

Booking integration is adapter-based. Implementation cannot begin until the
controller names one authoritative contract owner and approves identifiers,
authentication, state mapping, version/order semantics, downtime, replay,
reconciliation, and deprecation behavior. The local projection accepts
idempotent upserts keyed by `(source_system, source_booking_id)`, ignores older
source versions, quarantines ownership conflicts, and never makes a failed or
ambiguous record report-eligible.

Internal events use a versioned envelope containing `eventId`, `eventType`,
`schemaVersion`, `occurredAt`, opaque `tenantId`, aggregate ID/version,
correlation/causation IDs, and the minimum non-clinical payload. Initial event
types include `report.scan-requested.v1`, `report.scan-completed.v1`,
`report.published.v1`, `report.superseded.v1`, and `report.withdrawn.v1`.
Consumers deduplicate by event ID and tolerate duplicates; ordering is required
only per aggregate version. No event includes patient display data, filename,
contact data, PDF bytes, report narrative, or storage URL.

Events are first committed to a PostgreSQL outbox in the domain transaction.
Workers claim rows using bounded batches and `FOR UPDATE SKIP LOCKED`, record
attempt/error/next-attempt metadata, and dead-letter to an operational exception
state after the approved retry limit. A broker can be added later behind the
dispatcher without changing domain transactions.

## Upload, publication, and content-delivery consistency

### Upload and scanning saga

1. Authorize actor and booking; record an idempotent upload attempt.
2. Stream at most 20 MiB to a server-derived random quarantine key while
   checking extension, declared MIME, PDF signature/structure, checksum, and
   decompression/resource limits. User filenames are display metadata only and
   are normalized; they never become paths or response headers directly.
3. Commit content metadata plus `scan-requested` outbox evidence. A storage
   upload without a committed reference is invisible and removed by an orphan
   sweeper.
4. A worker submits the quarantined object to the approved scanner. Authenticated
   results are idempotent and correlated to the expected object checksum.
5. A clean result promotes/copies bytes to a separate clean private namespace,
   verifies the checksum, and commits an immutable `PENDING` version. Rejected
   or quarantined objects never enter the clean namespace and are disposed under
   policy after evidence is retained.
6. Copy/transaction failures leave an explicit recoverable state. Reconcilers
   compare database references, quarantine/clean inventories, scan jobs, and
   checksums; they never infer patient visibility from object presence.

No database transaction is held open while browser bytes upload or the scanner
runs. The saga uses durable intermediate states, idempotency, checksum matching,
and compensating cleanup instead of claiming cross-store atomicity.

### Publication, correction, and withdrawal

These commands run in a PostgreSQL transaction with an optimistic aggregate
version and row lock on the report aggregate. The transaction validates current
authorization and state, changes report/version state, appends required audit
evidence, and writes outbox events. Failure of any required database write rolls
back the command and the UI must not announce success.

The database partial unique constraint for one `AVAILABLE` version plus the
aggregate lock prevents double publication. A correction transaction first
supersedes the old version and then exposes the new version atomically.
Withdrawal commits the state change and revocation event before success.

### Patient content delivery

The initial design uses a backend-mediated stream from private clean storage,
not a reusable presigned URL or public CDN. Before each request—including a
range/retry—the server re-evaluates session/step-up, patient link, booking
ownership, current available version, restriction/hold policy, and rate limit,
then durably records the authorized access decision. Responses use a safe fixed
PDF content type, sanitized filename, `X-Content-Type-Options: nosniff`, a
restrictive content security policy/sandbox where previewed, and
`Cache-Control: private, no-store`.

Withdrawal prevents every new request or range after commit. Bytes already
delivered cannot be recalled, and an in-flight response may have begun before
withdrawal; the exact active-stream cancellation target requires security and
clinical approval. The implementation should support best-effort cancellation
through a short server stream lease, but must not describe it as retroactive
revocation.

## PostgreSQL design

### Ownership and core relations

All new identifiers are application-generated opaque UUIDs and all times are
`TIMESTAMPTZ` in UTC. Tenant-owned tables contain `tenant_id` directly, expose
`UNIQUE (tenant_id, id)`, and use composite foreign keys so a relationship
cannot cross tenants accidentally.

| Owning module/table family                                                     | Essential data and constraints                                                                                                                                                                        |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_tenant`, `access_principal`, `access_staff_membership`                 | unique external issuer/subject mapping; membership role/status/effective times; no report-content permission implied by tenant-admin role                                                             |
| `access_patient_account`, `access_patient_link`                                | tenant/source patient reference, proofing decision/provenance/status, approved/revoked times; unique active unambiguous mapping according to the approved identity policy                             |
| `booking_projection`                                                           | tenant, source system/ID/version, patient link, service code/display, scheduled/completed time, mapped eligibility, provenance hash and observed time; unique source identity                         |
| `booking_sync_cursor`, `booking_reconciliation_issue`                          | source checkpoint and restartable exception lifecycle; uniqueness prevents duplicate unresolved source conflict                                                                                       |
| `report`                                                                       | tenant, booking, patient link, aggregate concurrency version, timestamps; ownership immutable                                                                                                         |
| `report_version`                                                               | tenant/report, positive monotonic version number, lifecycle enum, clean content-object reference, checksum, source metadata, immutable created fields, publish/withdraw/supersede evidence references |
| `report_upload_attempt`, `report_content_object`                               | actor/context-scoped idempotency, quarantine/clean random key, byte size `1..20 MiB`, SHA-256, validation/scan state, cleanup/disposition state                                                       |
| `audit_event`                                                                  | append-only actor/service identity, tenant, subject/object opaque IDs, action, outcome, purpose/reason code, time, correlation/causation and integrity-chain fields; no report content                |
| `outbox_event`                                                                 | unique event ID, aggregate/version, schema, safe JSON payload, attempt/lease/next-attempt/published state                                                                                             |
| `privacy_request`, `retention_policy_version`, `legal_hold`, `disposition_job` | verified requester/scope, workflow/deadline/decision, versioned data-class rule, hold scope, restartable action and reconciliation evidence                                                           |
| `idempotency_record`                                                           | scoped key hash, normalized request hash, operation, durable outcome reference/status, expiry; no raw credentials or file content                                                                     |

Sensitive upstream identifiers and identity-proofing evidence are minimized and
application-envelope-encrypted with versioned keys. Deterministic lookup uses a
separate keyed blind index only when required; display labels are encrypted or
derived at an authorized boundary and never put in general audit/telemetry.
Disk, replicas, backups, object storage, queues, and exports additionally use
provider encryption with separately controlled keys.

### Database-enforced invariants

- foreign keys use explicit restrictive delete behavior; clinical/report/audit
  history is never cascade-deleted from a tenant, account, booking, or report;
- `UNIQUE (report_id, version_number)` makes version numbering monotonic in the
  locked aggregate transaction;
- a partial unique index on `report_version(report_id) WHERE state =
'AVAILABLE'` permits at most one current available version;
- check constraints enforce allowed sizes, nonblank opaque storage keys,
  required timestamps/reason codes for terminal lifecycle states, and valid
  retention/request states;
- finalized content-reference, checksum, tenant, booking, patient, report and
  version fields are immutable through database privilege/trigger protection
  in addition to domain rules;
- the runtime role cannot update/delete `audit_event`; approved retention uses
  a separate controlled maintenance role and records disposition evidence;
- tenant tables use PostgreSQL row-level security as defense in depth. For
  staff work the application sets a transaction-local verified actor and active
  tenant; for patient work it sets the verified patient-account identity and
  policies restrict rows through active patient links, including legitimate
  links across clinics. Policies deny access when the required context is
  absent, and background/maintenance roles are separate and tested. Object
  ownership and lifecycle state remain mandatory application/query conditions
  rather than being delegated solely to RLS.

Spring Modulith tests protect code dependencies. PostgreSQL integration and
migration tests must use the supported PostgreSQL major version (currently 16
in local Compose), because the existing H2 test profile cannot verify partial
indexes, row-level security, locking, PostgreSQL types, or production query
plans.

### Query paths and indexes

Indexes are confirmed with representative `EXPLAIN (ANALYZE, BUFFERS)` evidence
rather than accepted from this proposal alone. Initial candidates are:

- clinic queue: `(tenant_id, lifecycle_state, relevant_time DESC, id DESC)` and
  narrow alternatives for approved booking reference/service/date filters;
- patient list: `(patient_link_id, lifecycle_state, relevant_time DESC, id
DESC)` with an available-state partial index;
- booking lookup: `(tenant_id, source_booking_id)` and approved normalized
  clinic search keys, never a global patient-label index;
- report ownership/direct access: `(tenant_id, id)`, `(tenant_id, booking_id)`,
  and `(report_id, version_number)`;
- outbox work: partial `(next_attempt_at, id)` for unpublished rows;
- reconciliation: `(state, next_attempt_at, id)` plus source identity;
- audit investigation: `(tenant_id, object_type, object_id, occurred_at DESC)`
  and time-partitioning only after growth evidence justifies it; and
- privacy deadlines/retention: `(state, due_at)` and approved disposition time
  excluding active holds.

Patient/staff list projections select only summary columns; they never join or
fetch object keys, encrypted identity evidence, or PDF content. Wildcard search
on unbounded encrypted personal data is not supported. If controller-approved
patient-label search is required, its normalization, blind-index leakage, and
minimum-query controls require a security/privacy decision.

### Migrations, retention, and recovery

Every schema change is a new immutable Flyway migration. Changes follow
expand-and-contract: add compatible structures, deploy dual-read/write only
when necessary, backfill with restartable bounded jobs and reconciliation,
switch consumers, then remove old structures in a later release. Application
deployments must tolerate the previous and next compatible schema during a
rolling release. Destructive rollback is not assumed; database changes roll
forward, while application rollback is allowed only while contracts remain
compatible.

No production import/backfill is currently designed. One requires a separate
inventory, lawful purpose, mapping, quarantine, restartability, reconciliation,
compensation, and temporary-copy disposal plan.

The retention schema can represent controller-approved rules and holds, but no
duration is encoded until DEC-006 receives qualified approval. Backups are not
used as an active archive and deletion semantics must define backup expiry and
restore-time reapplication. Production design requires PostgreSQL continuous
WAL/PITR and snapshots, object versioning/integrity inventory, encrypted backup
copies in an approved failure domain, and a restore runbook. A restore drill
must reconcile tenant/report/version/object checksum/audit/hold state and prove
RPO <= 15 minutes and RTO <= 4 hours before release.

## Security and privacy architecture

### Identity and authorization

- Use OIDC authorization code flow through an approved provider; do not build
  password, MFA, or account-recovery cryptography in healthAlst.
- Use a server-side opaque session cookie with `Secure`, `HttpOnly`, appropriate
  `SameSite`, rotation after authentication/privilege change, inactivity and
  absolute expiry, and centralized revocation. Session-store technology is a
  provider/deployment decision, not browser local storage.
- Require staff MFA claims and patient step-up for content access according to
  the approved policy. Missing/stale assurance redirects through the provider;
  client state cannot assert it.
- Resolve OIDC issuer/subject to an active internal principal, then combine role,
  tenant membership, patient link, object ownership, lifecycle state, action,
  and policy restrictions. Deny if any input is absent or ambiguous.
- Enforce CSRF tokens and origin checks on cookie-authenticated mutations;
  configure secure response headers and a restrictive CSP at the web edge.
- Provision, change, and revoke access through named audited commands. Provider
  deactivation and internal revocation invalidate active sessions within the
  approved incident target.

### File and content controls

Only structurally valid PDFs within 20 MiB enter quarantine. File validation
must address mismatched MIME/signature, embedded active content, polyglots,
archive/decompression abuse, dangerous filenames, parser resource exhaustion,
and the standard scanner test signature. PDF rendering is sandboxed; the
application does not execute embedded JavaScript, launch URLs automatically, or
trust document metadata. Scanner, storage and preview libraries/providers
require threat and supply-chain review.

Quarantine and clean objects use separate least-privilege service roles and
namespaces. Buckets deny public access, list access to web identities, and
unencrypted transport. Object keys are random and contain no tenant, patient,
booking, filename, or report identifiers. Object access, KMS use, policy
changes, scan outcomes, and integrity mismatch are monitored.

The architecture can make application chrome and delivery controls accessible,
but it cannot make an inaccessible clinic-supplied PDF accessible. Before
release the controller must require tagged accessible PDFs or provide an
authoritative accessible equivalent and remediation route; this remains
`UXF-003`, not a solved architecture claim.

### Privacy and privileged operations

Data minimization is enforced in DTO projections, events, logs, metrics,
traces, support references, exports, and operator consoles. Correlation IDs and
opaque internal IDs replace patient labels and source references in telemetry.
No session replay, third-party analytics, error-report payload, or support tool
may capture report content or sensitive form fields without explicit privacy
approval.

Platform operations use metadata-only views. There is no standing content
access, cross-tenant support search, impersonation, or break-glass feature.
Future emergency access requires reopened requirements and a purpose-bound,
time-limited, dual-authorized, alerted, immutable, independently reviewed
design.

## Failure handling and reconciliation

| Failure                              | Safe behavior                                                                                                              | Durable recovery                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| identity unavailable                 | existing sessions follow short approved validation policy; new login/step-up fails closed                                  | alert, provider runbook, session/revocation reconciliation                           |
| booking source unavailable           | serve last reconciled projection with observed-at metadata; block action when eligibility freshness exceeds approved limit | retry with jitter, cursor replay and full reconciliation                             |
| database unavailable                 | readiness fails; mutations and protected content access return generic unavailable, never success                          | managed failover/restore and integrity reconciliation                                |
| quarantine/clean storage unavailable | upload/access fails or remains explicit queued state; no visibility change                                                 | bounded retry, object/database inventory reconciliation                              |
| scanner unavailable/slow             | version remains scanning and patient-hidden                                                                                | observable queue age, bounded retry, operator exception; never manual clean override |
| outbox worker crash/duplicate        | transaction state remains durable; duplicate delivery is harmless                                                          | lease expiry, idempotent replay, dead-letter review                                  |
| audit append failure                 | protected mutation/content grant fails in the same database transaction                                                    | retry after audit recovery; no bypass                                                |
| cache/rate-limit dependency failure  | no authorization broadening; sensitive cache is bypassed and rate-limit policy fails according to abuse risk               | alert and dependency recovery; no cross-user fallback cache                          |
| object checksum mismatch             | deny/quarantine content and raise security incident                                                                        | evidence preservation, clean-source recovery, affected-object reconciliation         |
| stale/concurrent command             | no state change; return safe precondition/conflict                                                                         | refetch and deliberate retry with a new precondition                                 |

Reconcilers are restartable application jobs with named ownership, bounded
batches, checkpoints, idempotent repair commands, dry-run/report mode for broad
actions, and metrics for backlog/age/outcome. They never directly patch domain
tables or make ambiguous data visible.

## Observability and operational design

Use structured application logs, Micrometer metrics, and OpenTelemetry traces
with a centrally generated correlation ID propagated through Next.js, Spring,
outbox work, scanner, booking adapters, and storage calls. Telemetry includes
operation name, safe actor type, opaque tenant bucket/reference, outcome,
duration, dependency, retry count, queue age and aggregate version—not patient
names, contact data, source booking references, filenames, storage keys, report
text, PDF bytes, tokens, or request bodies.

SLIs cover authenticated list/content/publication success and latency,
authorization denials/anomalies, upload/scan outcome and age, booking freshness
and reconciliation backlog, outbox backlog, content integrity, privacy-request
deadlines, database/storage dependency health, and backup/restore freshness.
The 99.9% objective needs a defined measurement window, exclusions, error
budget, alert thresholds, and named responders in delivery planning.

Actuator liveness reports only process viability. Readiness checks database and
the dependencies needed for the served path, with internal component detail
restricted to operators; the public response remains generic. Optional
dependency degradation is represented in internal metrics rather than making
all endpoints globally unavailable.

Production topology must use health-checked rolling instances across failure
domains, managed PostgreSQL with PITR, durable private object storage, automated
key/secret providers, restricted admin networking, TLS everywhere, image and
dependency scanning, immutable deployment artifacts, and tested rollback.
Exact providers/region and capacity cannot be accepted until DEC-007 and
delivery-plan evidence exist.

## Capacity and performance approach

The only approved workload datum is at least 500 report summaries for the list
journey; concurrent users, tenant skew, upload rate, PDF size distribution,
retention volume, scanner throughput, and booking event rate are unknown.
Therefore this document sets mechanisms, not unsupported sizing claims.

Server pagination, summary projections, bounded upload/worker pools, connection
pool limits, scanner backpressure, outbox batches, storage streaming, and
timeouts protect resources. No report-content cache or list-content prefetch is
introduced. A distributed cache is not required for first implementation
unless profiling or the chosen session/rate-limit provider justifies it.

Delivery planning must define a representative generated dataset and workloads,
then measure browser budgets, API p50/p95/p99, database plans, connection and
worker saturation, upload/content bandwidth, scanner queue age, storage/audit
growth, backup windows, third-party quotas, and at least 30 controlled browser
trials for the specified experience budgets.

## Architectural decisions and alternatives

| Decision                       | Recommendation and rationale                                                                                                                             | Alternatives not selected now                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AR-001 deployment shape        | preserve the Spring Modulith modular monolith and one Next.js application; this fits the scaffold and keeps cross-module report transactions enforceable | microservices add network consistency, authorization and operational failure modes before scale evidence exists                                           |
| AR-002 web security boundary   | same-origin Next.js plus Spring-owned OIDC server session and authorization                                                                              | browser-held bearer tokens increase token exposure; custom identity is prohibited                                                                         |
| AR-003 persistence             | PostgreSQL owns transactional metadata, audit and outbox; private object storage owns PDF bytes                                                          | database BLOBs increase backup/query coupling; filesystem storage is not horizontally safe                                                                |
| AR-004 integration reliability | local booking projection with reconciliation and PostgreSQL transactional outbox                                                                         | live-only booking queries make availability and publication depend on upstream latency; broker-first adds infrastructure without removing the outbox need |
| AR-005 content delivery        | freshly authorized backend-mediated streaming without public CDN/presigned URLs                                                                          | reusable signed URLs weaken immediate state checks and withdrawal; CDN caching risks disclosure                                                           |
| AR-006 tenancy defense         | mandatory scoped repository queries plus composite tenant FKs and PostgreSQL RLS defense in depth                                                        | application checks alone leave a single-query failure path; database-per-tenant is operationally excessive at unknown scale                               |
| AR-007 concurrency             | optimistic ETags/idempotency plus aggregate row locking and partial uniqueness for publication                                                           | last-write-wins can silently overwrite clinical delivery state; distributed locks add unnecessary failure modes                                           |
| AR-008 async processing        | durable saga states and in-process workers initially, with broker adapter available later                                                                | synchronous scanning holds requests open and fails poorly; broker-first is deferred until throughput/availability evidence requires it                    |

The durable ADR for these recommendations is
`docs/engineering/architecture/adr/0001-protected-report-delivery.md`. It remains
proposed until the architecture gate is approved.

## Compatibility, rollout, and reversal

The existing `/api/v1/platform/status` slice remains compatible. New modules,
routes, tables, and dependencies are additive. The first vertical slice must run
only with generated non-production data and feature controls that keep report
routes unreachable until identity, tenant and storage configuration is valid.

Recommended rollout order:

1. add PostgreSQL-backed module boundaries, access context, audit/outbox
   primitives and PostgreSQL integration tests;
2. integrate non-production OIDC and tenant/staff authorization;
3. build booking projection/reconciliation against an approved sandbox
   contract;
4. add quarantine storage, validation/scanning saga and pending staff view;
5. add publication and patient list with full hidden-state access matrix;
6. add server-mediated content access and withdrawal/revocation;
7. add correction/supersession, privacy/retention, operational evidence and
   accessibility treatments; and
8. validate capacity, restore, incident, security/privacy and end-to-end
   journeys before any production-data release.

Application rollback is allowed only before a migration/contract feature is
required by new data. Schema and event evolution roll forward with compatible
readers. Disabling a faulty feature must preserve report state, audit, objects,
and reconciliation queues. No rollback may restore patient access to a
withdrawn/superseded report or re-enable a revoked identity.

## Traceability and required evidence

| Architecture decision                 | Requirements                                      | Evidence required downstream                                                                  |
| ------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| AR-001, module ownership              | OUT-004, FR-012–FR-015, REL-004                   | Modulith verification, transaction/failure tests, operational ownership                       |
| AR-002 identity/session/authorization | FR-001–FR-003, AUTH-001–AUTH-005, SEC-001         | approved provider/policy, full actor/object/state/action matrix, session/MFA/revocation tests |
| AR-003 storage/data lifecycle         | FR-006, FR-009–FR-013, DATA-001–DATA-007          | PostgreSQL/object/scanner integration, integrity, retention and restore evidence              |
| AR-004 booking/outbox/reconciliation  | FR-004, FR-007, FR-011, FR-015, INT-001–INT-002   | approved booking contract, consumer/provider and replay/crash/reconciliation tests            |
| AR-005 content stream                 | FR-008–FR-009, FR-011, PERF-003, SEC-001–SEC-002  | access matrix, headers/range/withdrawal/browser-network and storage-policy tests              |
| AR-006 database isolation             | AUTH-002–AUTH-004, DATA-001–DATA-002, PERF-006    | PostgreSQL RLS/FK/constraint/mixed-tenant and query-plan tests                                |
| AR-007 lifecycle concurrency          | FR-007, FR-010–FR-012, API-002, REL-004           | idempotency, ETag, row-lock, unique-index, audit-atomicity and failure-injection tests        |
| AR-008 async scanning                 | FR-006, FR-014–FR-015, REL-003                    | malware, timeout, retry, duplicate, queue-age, orphan and reconciliation tests                |
| observability/deployment/recovery     | REL-001–REL-005, OBS-001–OPS-002, SEC-003–SEC-005 | SLI/dashboard/alert, dependency failure, SBOM, backup/restore, runbook and tabletop evidence  |

## Open decisions, risks, and gate readiness

| ID           | Decision/evidence still required                                                                        | Owner                                       | Consequence if unresolved                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| ARC-OPEN-001 | named operating legal entity, controller clinics and responsibility/contracts                           | product owner, legal/privacy                | no real-data processing or production release                             |
| ARC-OPEN-002 | approved OIDC provider, identity proofing/linking/recovery/MFA/step-up and revocation targets           | security/privacy, product owner             | identity implementation and protected routes cannot be accepted           |
| ARC-OPEN-003 | authoritative booking owner/contract, identifiers, eligibility/freshness and reconciliation             | product/domain owner, architect             | booking module cannot safely implement eligibility                        |
| ARC-OPEN-004 | approved object store, KMS, malware scanner, PDF validation/preview and active-stream withdrawal target | security/privacy, architect, clinical owner | upload/content implementation cannot be production-approved               |
| ARC-OPEN-005 | controller-approved retention/hold/deletion schedule                                                    | legal/privacy, controller                   | final retention constraints/jobs and production schema cannot be accepted |
| ARC-OPEN-006 | hosting region, subprocessors, transfer safeguards and production topology                              | controller/legal, security, SRE             | production architecture and DPIA remain incomplete                        |
| ARC-OPEN-007 | tagged-PDF or authoritative accessible-alternative policy                                               | product/clinic accessibility owner          | patient report experience may exclude disabled users                      |
| ARC-OPEN-008 | representative workload, support/on-call ownership and funded recovery design                           | product owner, SRE                          | capacity, 99.9%, RPO and RTO remain unproved                              |

The proposed boundaries, contracts, data model, consistency model, failure
handling, security controls, observability approach, alternatives, migration
strategy, and downstream evidence are sufficiently defined for accountable
architecture review. The gate remains `draft`: the named providers/contracts,
region, retention policy, PDF accessibility treatment, revocation target, and
operational ownership are real production decisions, not details that may be
invented. An architect may approve the baseline only with those items retained
as explicit implementation/release blockers and assigned for closure, or after
their evidence is added here.
