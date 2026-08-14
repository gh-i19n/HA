---
sdlc_gate: requirements
status: complete
---

# Requirements Baseline

## Baseline status, authority, and evidence

This is the requirements baseline for a real healthAlst product serving real
imaging centers, staff, patients, bookings, and imaging reports. The interview
is an evaluation context, not a reduction in product, data, security, privacy,
or operational scope.

The product owner accepted all recommended first-release defaults on 2026-08-13.
The baseline is therefore complete for final requirements-gate approval and
downstream experience/architecture feasibility assessment. Qualified domain,
privacy, security, clinical, and legal evidence required by the approved
decisions remains a release condition; product-owner acceptance does not
fabricate that evidence.

Evidence codes used below:

- **BRIEF:** product-owner-supplied Imaging Report Dashboard task;
- **IDEA:** `docs/sdlc/00-ideation.md`;
- **DISC:** corrected cycle-2 `docs/sdlc/01-discovery.md`;
- **PO:** explicit product-owner decisions recorded in the lifecycle artifacts;
- **REPO:** observed repository and modular-monolith constraints;
- **NDPA:** Nigeria Data Protection Act 2023 and the current NDPC
  implementation context cited in discovery.

In this document, **must** is required, **should** requires recorded rationale
to omit, and **may** is optional. `P0` is required for the first releasable
product slice; `P1` is planned immediately after P0 and must not be used to
defer a P0 safety or legal obligation. Passing this gate approves requirements,
not implementation, deployment, processing of real data, or legal compliance.

## Product scope and prioritized outcomes

### Required outcomes

| ID      | Priority | Outcome                              | Observable acceptance                                                                                                                                                                          |
| ------- | -------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OUT-001 | P0       | Safe report handoff                  | Authorized clinic staff can associate a clinically final report with the correct booking and control patient availability through an auditable lifecycle.                                      |
| OUT-002 | P0       | Confidential patient access          | An authenticated patient can access only available reports belonging to that patient's bookings, with zero cross-patient or cross-clinic disclosure in the required authorization test matrix. |
| OUT-003 | P0       | Correctable clinical record delivery | Published reports can be superseded or withdrawn without silent overwrite, loss of history, or continued access to an unsafe version.                                                          |
| OUT-004 | P0       | Operable real service                | The product has enforceable identity, tenancy, privacy, upload-security, audit, observability, backup/recovery, support, and incident controls before real-data release.                       |
| OUT-005 | P0       | Accessible, resilient journeys       | Administrator and patient journeys include complete loading, empty, error, unauthorized, conflict, and recovery states across supported devices and assistive use.                             |
| OUT-006 | P1       | Measured list scalability            | A clinic can manage at least 500 report summaries using server pagination and the team can reproduce before/after performance evidence.                                                        |
| OUT-007 | P1       | Interoperability-ready boundaries    | Booking/report models and contracts can later map to authoritative clinical standards and systems without treating the initial internal schema as a clinical standard.                         |

### First-release scope

- Real clinic organizations and branch/tenant boundaries.
- Real staff and patient accounts backed by an approved production identity and
  account-linking process.
- Existing bookings obtained from an authoritative booking source; booking
  creation, scheduling, payment, and clinical procedure management are outside
  this product slice.
- Administrator report queue, booking lookup, upload, malware/validation
  processing, pending review, publication, correction, supersession, and
  withdrawal.
- Patient report list and explicit, re-authorized viewing or downloading of
  available reports.
- Persistent report metadata, secured report content, immutable version history,
  access/mutation audit, operational telemetry, backup, and recovery.
- Production controls for authentication, clinic tenancy, object authorization,
  privacy notices and data-subject requests, retention/hold, security incidents,
  and support.
- Generated non-production data for local development and automated tests;
  production-like controls in staging; real data only in approved environments.

### Explicit non-goals for the first release

- Creating, changing, or paying for bookings.
- Authoring or clinically interpreting a report, diagnostic decision support,
  treatment advice, or automated clinical claims.
- Diagnostic-image viewing or DICOM object storage.
- Patient messaging, readiness notifications, report sharing, referring-clinician
  access, marketing, and population analytics.
- Self-service clinic onboarding, cross-clinic staff access, and emergency or
  support impersonation.
- A claim of FHIR, DICOMweb, Nigerian regulatory, or clinical certification
  before the relevant conformance and approval evidence exists.

## Actors, roles, and trust boundaries

| Actor/role                  | Required authority                                                                                                                                                         | Prohibited authority                                                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clinic report administrator | Within assigned clinic/branch: find eligible bookings; list reports; upload, publish, correct, supersede, and withdraw reports; inspect lifecycle audit needed for the job | Any other clinic; patient account administration unless separately authorized; changing report authorship or clinical content outside the approved workflow; deleting history |
| Patient                     | View/download available reports linked to that patient's verified account and bookings; exercise supported privacy/account rights                                          | Pending, quarantined, rejected, withdrawn, superseded, other-patient, or other-clinic data; administrator operations                                                          |
| Clinic tenant administrator | Provision/deprovision staff and assign least-privilege clinic roles through the approved identity model                                                                    | Report content access merely because the actor administers accounts; cross-clinic access                                                                                      |
| Privacy/records operator    | Fulfil approved access, rectification, restriction, export, retention, and deletion workflows with dual control where required                                             | Clinical alteration, report publication, or unrestricted browsing                                                                                                             |
| Platform operator           | Operate infrastructure from metadata and telemetry with no routine report-content access                                                                                   | Patient or clinic impersonation and content browsing; any emergency access not separately approved, time-limited, audited, and reviewed                                       |
| Security/incident responder | Investigate security events using least-privilege evidence and an approved incident process                                                                                | Unrecorded report access or indefinite elevated privilege                                                                                                                     |

### Trust-boundary rules

1. Authentication establishes an account; server-side authorization separately
   establishes role, active clinic, patient identity, booking ownership, report
   state, and permitted action for every request.
2. Client-side routing, hidden buttons, cached state, object identifiers, signed
   URLs, and storage paths are never authorization decisions.
3. Clinic, patient, booking, report, version, file, list count, audit, error,
   search, log, metric, trace, export, and backup data all remain inside the same
   confidentiality boundary.
4. Access is denied by default. A denial must not reveal whether another
   clinic's or patient's object exists.
5. Privileged operational access must use named accounts, least privilege,
   strong authentication, purpose limitation, time bounds, immutable audit, and
   independent review; no shared or standing content-access account is allowed.

## Domain definitions and invariants

- A **clinic tenant** is the top-level authorization owner for bookings and
  reports. A branch relationship, if later supported, may narrow but never
  broaden tenant access.
- A **patient identity** is a verified person account linked to one or more
  authoritative patient/booking records through an approved matching process.
  Name, phone number, email address, or knowledge of a booking identifier alone
  is insufficient proof of ownership.
- A **booking** is an authoritative imaging-service record owned by one clinic
  and one patient. A report may be attached only when the booking satisfies the
  clinic-approved eligible state.
- A **report** belongs permanently to one booking and inherits its clinic and
  patient ownership. Ownership fields cannot be supplied or changed by a report
  upload request.
- A **report version** contains immutable report content and metadata. Replacing
  published bytes in place is prohibited.
- Patient visibility is a server-enforced state. At minimum, the lifecycle must
  distinguish content awaiting validation/review, `pending`, `available`,
  `withdrawn`, `superseded`, rejected, and quarantined content even if the UI
  groups some internal states.
- At most one report version for a report may be current and `available`.
  Publishing a correction and superseding the prior version are one atomic
  operation.
- Pending, scanning, quarantined, rejected, withdrawn, superseded,
  other-patient, and other-clinic reports must not affect a patient's rows,
  counts, empty-state wording, direct-access response detail, or downloadable
  content.
- Clinical/report content, lifecycle events, access events, and retention/legal
  holds have distinct purposes and may have distinct retention rules; deleting
  one must not silently corrupt another required record.

## Functional requirements and acceptance criteria

### FR-001 — Authenticate and establish a safe account context

- **Source:** DISC target journey and unknowns; NDPA security; OUT-002/OUT-004.
- **Actor/outcome:** Staff and patients establish a verified, accountable session
  appropriate to the sensitivity of report access.
- **Preconditions/trigger:** An enrolled account starts sign-in or a protected
  session requires reauthentication.
- **Required behavior:** The product must integrate an approved identity system,
  require MFA for clinic and privileged users, apply the approved patient
  identity-proofing and authentication policy, bind sessions to a single named
  account, enforce expiry/inactivity/revocation, and require step-up
  authentication for defined high-risk actions.
- **Failure/recovery:** Unknown, disabled, locked, expired, unverified, or
  suspicious accounts receive bounded recovery paths that do not disclose
  account existence or bypass identity proofing. Deprovisioning and reported
  compromise revoke active sessions within the approved response target.
- **Authorization/data:** Authentication claims are verified server-side and
  mapped to internal roles/scopes; arbitrary client claims are ignored.
- **Acceptance criteria:** Automated tests cover success, invalid credentials,
  missing/failed MFA, expiry, revocation, disabled user, role change, account
  recovery, and session fixation; no protected API accepts a missing or invalid
  session.
- **Verification:** Identity integration/contract tests, security tests, and
  browser journeys.
- **Priority/dependencies/owner/status:** P0 / DEC-002 and architecture identity
  decision / security, backend, QA / draft.

### FR-002 — Provision and revoke clinic staff access

- **Source:** DISC real clinic/operating boundary; least privilege.
- **Actor/outcome:** A clinic tenant administrator controls which named staff
  members may administer reports for that clinic.
- **Preconditions/trigger:** The clinic and tenant administrator are verified;
  staff employment/authority is established outside or through an approved
  onboarding process.
- **Required behavior:** Provision, role change, suspension, and revocation must
  record actor, tenant, subject, role, reason, timestamp, and effective state.
  Role changes must affect new authorization decisions without requiring data
  repair.
- **Failure/recovery:** Duplicate or stale changes are idempotent or conflict;
  the last valid administrator for a clinic cannot be removed without an
  approved recovery path.
- **Authorization/data:** Tenant administrators can manage only their tenant and
  do not receive report-content authority solely from account administration.
- **Acceptance criteria:** Tests prove cross-clinic denial, least-privilege role
  mapping, session revocation after suspension, immutable audit, and safe
  recovery from a locked-out tenant.
- **Verification:** Service/API integration and identity synchronization tests.
- **Priority/dependencies/owner/status:** P0 / FR-001, DEC-001 / security,
  backend, QA / draft.

### FR-003 — Link a patient account to authoritative records

- **Source:** DISC identity and booking-matching risk; OUT-002.
- **Actor/outcome:** A patient account is linked to the correct authoritative
  patient/booking record without exposing another person's reports.
- **Preconditions/trigger:** A patient enrolls, a clinic supplies an approved
  invitation/link, or authoritative identity data changes.
- **Required behavior:** Matching must use the approved identity-proofing policy,
  record provenance and confidence/decision evidence, support manual exception
  handling with separation of duties, and prevent ambiguous matches from
  becoming active automatically.
- **Failure/recovery:** Mismatch, duplicate person records, changed contact
  details, suspected takeover, and unresolved identity must block report access
  while providing a privacy-preserving recovery route.
- **Authorization/data:** Patient self-assertion, names, phone/email possession,
  or booking reference alone cannot establish ownership.
- **Acceptance criteria:** Tests cover unique match, no match, multiple match,
  cross-clinic identifiers, duplicate records, manual approval, revocation, and
  account takeover; ambiguous cases disclose no report metadata.
- **Verification:** Domain/integration tests, threat-model scenarios, and user
  journey validation.
- **Priority/dependencies/owner/status:** P0 / DEC-002, authoritative booking
  contract / product, security, backend, QA / draft.

### FR-004 — Synchronize and reconcile eligible bookings

- **Source:** BRIEF booking association; DISC authoritative-source unknown.
- **Actor/outcome:** Staff find current, correctly owned bookings without healthAlst
  becoming an ungoverned second source of truth.
- **Preconditions/trigger:** The approved booking source creates/changes a
  booking or an authorized staff member searches for it.
- **Required behavior:** The integration must ingest or query stable source
  identifiers, clinic, patient, imaging service, schedule/completion state, and
  source version; it must be idempotent, validate tenant ownership, record
  provenance, and reconcile missed/out-of-order updates.
- **Failure/recovery:** Unknown tenant/patient, duplicate/conflicting source IDs,
  stale events, source outage, and ownership changes enter an exception queue
  and must not silently attach or expose a report.
- **Authorization/data:** Staff search is restricted to their clinic before any
  filter, total, or result is computed.
- **Acceptance criteria:** Contract tests cover create/update/replay/out-of-order
  data, duplicates, clinic mismatch, patient mismatch, ineligible state, outage,
  and reconciliation; no failed record becomes report-eligible.
- **Verification:** Contract, integration, reconciliation, and failure tests.
- **Priority/dependencies/owner/status:** P0 / DEC-003, API/architecture decision
  / product, backend, QA / draft.

### FR-005 — List and search the clinic report queue

- **Source:** BRIEF; IDEA performance budget; OUT-001/OUT-006.
- **Actor/outcome:** Authorized clinic staff manage the correct tenant's queue at
  representative volume without loading report content.
- **Preconditions/trigger:** An authorized report administrator opens or changes
  list state.
- **Required behavior:** The server must provide deterministic pagination of no
  more than 50 summaries, sorting, and filters for lifecycle status, booking
  reference, patient display label, imaging service, and relevant date. URL
  state must support refresh/back/forward. Each summary shows only fields needed
  for the task; content bytes are not fetched.
- **Failure/recovery:** Invalid query values produce bounded validation and a
  recoverable UI; dependency failure retains safe list state and retry. A reset
  action clears filters without broadening tenant scope.
- **Authorization/data:** Tenant scope is applied before search, sort, totals,
  pagination, caching, and export. Search input and results must not enter
  analytics or logs as patient data.
- **Acceptance criteria:** With at least two clinics and 500 summaries in one,
  every row and total belongs to the active clinic, pages have no duplicates or
  gaps under stable sort, at most 50 summaries transfer/render, and no report
  content request occurs before explicit access.
- **Verification:** Repository/API tests, cache-isolation tests, browser journey,
  and network inspection.
- **Priority/dependencies/owner/status:** P0; performance evidence P1 / FR-001,
  FR-004 / frontend, backend, QA / draft.

### FR-006 — Upload and validate a clinically final report

- **Source:** BRIEF; PO administrator upload authority; DISC upload risks.
- **Actor/outcome:** Authorized clinic staff attach the correct, already
  clinically approved report to the correct eligible booking.
- **Preconditions/trigger:** Staff have report-admin authority for the booking's
  clinic; booking is eligible; source report has completed the clinic's clinical
  approval process.
- **Required behavior:** The UI must display booking/patient/service context for
  confirmation. The server derives ownership from the booking, validates the
  approved format/size/signature, scans content for malware, stores content in
  non-public protected storage, creates an immutable pending version, and
  records provenance and checksum. Content cannot be published before all
  validation/scanning steps pass.
- **Failure/recovery:** Wrong type, size, signature, malware, corrupted file,
  ineligible/stale booking, duplicate request, storage failure, scan outage, and
  cross-clinic ID produce explicit staff-safe states. Rejected/quarantined bytes
  are isolated and disposed under policy; no patient-visible record is created.
- **Authorization/data:** The client cannot choose clinic/patient ownership or
  bypass scan/pending states. Upload staging locations are private and
  time-bounded.
- **Acceptance criteria:** Boundary tests cover valid PDF, configured limit,
  MIME/signature mismatch, executable/polyglot content, malware test signature,
  corruption, duplicate/retry, ineligible booking, cross-clinic access, scan
  timeout, storage failure, and cleanup. A successful upload remains patient
  invisible.
- **Verification:** Validation/security tests, object-storage integration,
  malware-scanner integration, transaction tests, and browser journey.
- **Priority/dependencies/owner/status:** P0 / DEC-004, FR-004, storage/scanner
  architecture / backend, security, QA / draft.

### FR-007 — Publish an approved pending report

- **Source:** BRIEF; PO publication authority and visibility policy.
- **Actor/outcome:** Authorized clinic staff deliberately make the correct report
  version available to the owning patient.
- **Preconditions/trigger:** Version is valid, scan-clean, pending, owned by the
  active clinic, and clinically final; staff review identifying context and
  confirm publication.
- **Required behavior:** Publication must atomically transition the version to
  available, record the actor/time/source state, emit a durable internal event,
  and make the version eligible for owning-patient access. It must use an
  idempotency key and concurrency precondition.
- **Failure/recovery:** Duplicate submission returns the completed outcome;
  stale, invalid, quarantined, rejected, withdrawn, or wrong-clinic requests do
  not publish. Transaction/event failure leaves no partially available report
  and is safely retryable.
- **Authorization/data:** Only the approved clinic report-administrator role for
  the owning tenant may publish.
- **Acceptance criteria:** Tests prove atomicity, idempotency, stale conflict,
  durable event/outbox behavior, audit, owning-patient availability, and zero
  other-patient/clinic visibility. Availability reaches the owning patient's
  refreshed view within 60 seconds at p95.
- **Verification:** Domain, database, API, event, and end-to-end browser tests.
- **Priority/dependencies/owner/status:** P0 / FR-006, AUTH requirements / backend,
  database, QA / draft.

### FR-008 — List a patient's available reports

- **Source:** BRIEF; PO patient visibility policy; OUT-002.
- **Actor/outcome:** An authenticated patient sees available report summaries
  for that patient's verified bookings.
- **Preconditions/trigger:** A safely linked patient account opens results.
- **Required behavior:** The server returns only current available versions and
  the minimum context needed to identify the imaging event. List content must be
  paginated and must not include report bytes.
- **Failure/recovery:** A patient with no available reports receives a neutral
  empty state that does not mention pending work. Dependency failure offers
  retry without cached data from another account.
- **Authorization/data:** Patient ownership and current available status are
  mandatory predicates applied before totals, caching, or pagination.
- **Acceptance criteria:** Mixed actor/state fixtures prove that pending,
  scanning, quarantined, rejected, withdrawn, superseded, other-patient, and
  other-clinic records do not affect rows, totals, timing class, or wording.
- **Verification:** Repository/API access-matrix tests, cache-isolation tests,
  and patient browser journey.
- **Priority/dependencies/owner/status:** P0 / FR-001, FR-003, FR-007 / frontend,
  backend, QA / draft.

### FR-009 — View or download an available report

- **Source:** BRIEF; IDEA explicit content-fetch rule; OUT-002.
- **Actor/outcome:** The owning patient deliberately accesses the current
  available report with fresh authorization.
- **Preconditions/trigger:** Report appears in the patient's list; the patient
  activates view/download and satisfies any required step-up authentication.
- **Required behavior:** The server must re-evaluate session, patient link,
  booking ownership, version state, and policy at access time. Delivery uses a
  private stream or short-lived, single-purpose access grant; safe content type,
  disposition, filename, caching, and browser security headers apply. Every
  successful/denied access is audited without logging content.
- **Failure/recovery:** If authorization or availability changes, access stops
  without revealing prior/current hidden state; the UI refreshes the list.
  Interrupted access may retry only through fresh authorization.
- **Authorization/data:** Permanent public URLs, guessable storage keys, client
  ownership parameters, and authorization-free CDN caching are prohibited.
- **Acceptance criteria:** The access matrix covers owner/non-owner, clinic,
  every state, expired/revoked session, expired grant, direct URL, range/retry,
  and concurrent withdrawal. Bytes transfer only after explicit action.
- **Verification:** Security/API integration, response-header, storage/CDN, audit,
  and browser network tests.
- **Priority/dependencies/owner/status:** P0 / FR-008, storage/identity design /
  security, backend, QA / draft.

### FR-010 — Correct and supersede a report through immutable versions

- **Source:** PO correction authority; DISC integrity risk; OUT-003.
- **Actor/outcome:** Clinic staff correct an available report without silently
  rewriting the historical record or exposing a draft correction.
- **Preconditions/trigger:** An available version belongs to the active clinic;
  authorized staff provide corrected clinically final content and an approved
  reason/category.
- **Required behavior:** The correction follows the same validation/scanning
  pipeline, creates a linked pending immutable version, preserves the current
  available version until explicit publication, and atomically publishes the
  correction while marking the previous version superseded. History records
  links and reasons without copying report content into audit.
- **Failure/recovery:** Validation, scan, storage, concurrency, or publication
  failure leaves the current available version unchanged. Concurrent
  corrections conflict and require review; they are not auto-merged.
- **Authorization/data:** Only owning-clinic report administrators may correct;
  patients do not see draft metadata, reasons, or superseded content unless an
  approved medical-record policy explicitly requires it.
- **Acceptance criteria:** Tests prove immutable content, one current available
  version, atomic supersession, no lost updates, preserved audit, and no patient
  draft disclosure.
- **Verification:** Domain/database concurrency, storage, audit, API, and browser
  tests.
- **Priority/dependencies/owner/status:** P0 / FR-006, FR-007, DEC-005 / backend,
  database, QA / draft.

### FR-011 — Withdraw an available report

- **Source:** PO withdrawal authority; OUT-003.
- **Actor/outcome:** Clinic staff stop patient access to a report that must no
  longer be presented while preserving accountable history.
- **Preconditions/trigger:** Current available version belongs to the active
  clinic; authorized staff supply an approved reason and confirm.
- **Required behavior:** Withdrawal must atomically change visibility, revoke
  active content grants/caches, record actor/time/reason, and emit a durable
  internal event. It must be idempotent and concurrency-protected.
- **Failure/recovery:** Failure leaves the prior durable state explicit; the UI
  must not claim withdrawal until committed. Retry cannot duplicate events or
  erase evidence.
- **Authorization/data:** Only owning-clinic report administrators may withdraw;
  patient responses must not expose reason or hidden report existence.
- **Acceptance criteria:** After commit, patient list/detail/content and existing
  grants reveal no metadata or bytes; administrator history remains available;
  concurrent access/withdraw tests satisfy the approved revocation target.
- **Verification:** Transaction, cache/grant revocation, audit, API, and browser
  concurrency tests.
- **Priority/dependencies/owner/status:** P0 / FR-009, DEC-005 / security,
  backend, QA / draft.

### FR-012 — Provide accountable report and access history

- **Source:** DISC operational job; NDPA accountability/security; OUT-004.
- **Actor/outcome:** Authorized clinic, privacy, security, and audit users can
  reconstruct report lifecycle and access without unrestricted content access.
- **Preconditions/trigger:** A supported investigation, reconciliation, privacy
  request, or audit occurs.
- **Required behavior:** Append-only evidence must cover account/role changes,
  booking link/provenance, upload/validation/scan, publish, correction,
  supersession, withdrawal, patient/staff content access, export, restriction,
  deletion/hold, and privileged access. Records include actor, tenant, subject,
  object/version, action, outcome, time, correlation, and reason where required.
- **Failure/recovery:** A mutation requiring audit must fail atomically if its
  audit evidence cannot be durably recorded. Audit export failure must not alter
  source evidence.
- **Authorization/data:** Audit access is purpose/role-scoped; report bytes and
  clinical narrative are excluded. Tampering/deletion outside approved
  retention must be detectable and denied.
- **Acceptance criteria:** Integration tests assert completeness and atomicity;
  role tests deny routine users; integrity checks detect alteration; searches
  meet the approved investigation time without exposing unrelated tenants.
- **Verification:** Database/event integration, authorization, integrity, and
  operational exercise.
- **Priority/dependencies/owner/status:** P0 / retention and audit architecture /
  privacy, security, backend, QA / draft.

### FR-013 — Fulfil privacy and medical-record lifecycle requests

- **Source:** NDPA rights; DISC real-product conditions; OUT-004.
- **Actor/outcome:** The accountable controller can receive, verify, track, and
  lawfully fulfil access, copy/export, correction, restriction, objection,
  erasure, and consent-withdrawal requests as applicable.
- **Preconditions/trigger:** A verified data subject or authorized representative
  submits a request through the approved controller process.
- **Required behavior:** The system must record request type, identity evidence,
  scope, legal/policy decisions, deadlines, actions, recipients, outcome, and
  appeal/complaint route; produce a commonly usable export where required; and
  apply restriction/deletion only according to approved medical-record,
  retention, legal-hold, and controller policies.
- **Failure/recovery:** Ambiguous identity, conflicting legal duty, active hold,
  third-party data, or failed downstream action enters reviewed exception state
  and is not silently completed.
- **Authorization/data:** Privacy/records operators use separate least-privilege
  roles and dual approval for destructive or broad actions; clinic boundaries
  remain enforced.
- **Acceptance criteria:** Workflow tests cover each supported right, identity
  failure, hold, partial denial, export, downstream reconciliation, deadline
  tracking, and immutable evidence. Exact duties/timelines require qualified
  review before release.
- **Verification:** Policy/workflow tests, privacy review, and operational
  tabletop.
- **Priority/dependencies/owner/status:** P0 / DEC-001, DEC-006 / privacy,
  product, backend, QA / draft.

### FR-014 — Present complete, accessible, and recoverable states

- **Source:** DISC accessibility/connectivity risks; OUT-005.
- **Actor/outcome:** Staff and patients understand the real outcome of each task
  and can recover without developer support or unsafe resubmission.
- **Preconditions/trigger:** Any page/request is loading, empty, successful,
  invalid, unauthorized, not found, conflicted, interrupted, quarantined,
  unavailable, or partially delayed.
- **Required behavior:** Each journey must provide distinct semantic states,
  preserve safe input where appropriate, move/announce focus to meaningful
  feedback, prevent double submission, identify whether retry is safe, and give
  an approved support path. Success is shown only after durable commit.
- **Failure/recovery:** Errors never reveal another patient/clinic, report
  existence, stack, query, storage path, secret, or report content.
- **Authorization/data:** Support links and correlation references contain no
  health data or raw identifiers.
- **Acceptance criteria:** Component and browser tests exercise all applicable
  states, keyboard/focus behavior, retry/idempotency, console, and network; no
  critical path depends solely on color, motion, pointer, or client-only state.
- **Verification:** Component, accessibility, browser, and API error-contract
  tests.
- **Priority/dependencies/owner/status:** P0 / experience design and API errors /
  UX, frontend, QA / draft.

### FR-015 — Reconcile failures and preserve durable delivery state

- **Source:** DISC operability; OUT-004.
- **Actor/outcome:** Operators detect and repair incomplete booking, upload,
  event, storage, or cache work without guessing or corrupting records.
- **Preconditions/trigger:** A dependency fails, event delivery is delayed,
  reconciliation finds divergence, or an operator starts an approved replay.
- **Required behavior:** External ingestion and internal events must be
  idempotent, observable, replayable, and tied to durable state. Failed work
  enters a bounded queue with reason, attempt count, next action, and alerting.
  Repair/replay uses authorized tooling and records evidence.
- **Failure/recovery:** Poison messages, repeated dependency failure, partial
  storage writes, and operator mistakes must not create duplicate reports,
  broaden access, or bypass validation/publication.
- **Authorization/data:** Operational views minimize health data and remain
  tenant/purpose scoped; privileged repair cannot directly change clinical
  content or patient ownership.
- **Acceptance criteria:** Failure-injection tests cover source outage,
  out-of-order/repeated event, database/object-store/scan/cache outage, poison
  input, replay, and recovery with no lost/duplicate/unauthorized state.
- **Verification:** Resilience integration tests and operator recovery exercise.
- **Priority/dependencies/owner/status:** P0 / architecture/observability /
  backend, SRE, QA / draft.

## Authorization and privacy requirements

| ID       | Requirement                                                                                                                                                                                                                                              | Observable acceptance                                                                                                                                          | Priority |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AUTH-001 | Every protected request must require a valid server-resolved identity, role, tenant/patient scope, object ownership, lifecycle state, and permitted action; deny by default.                                                                             | API authorization matrix covers missing/malformed/expired/revoked identity, every role, clinic, patient, object, state, and action with zero unintended allow. | P0       |
| AUTH-002 | Clinic scope must be applied before lookup, search, total, pagination, cache key, export, audit query, and mutation.                                                                                                                                     | Mixed-tenant integration/cache tests show no data or count crossover and no cross-tenant timing/detail distinction beyond the approved not-found behavior.     | P0       |
| AUTH-003 | Patient scope must require a verified patient link plus current `available` state for list, detail, content, and derived metadata.                                                                                                                       | Mixed-patient/state tests produce zero disclosure, including direct IDs, URLs, counts, filenames, timestamps, and cache artifacts.                             | P0       |
| AUTH-004 | Staff role assignment and report-content access are separate permissions; tenant or platform administration alone grants no report-content access.                                                                                                       | Role-combination tests deny content unless the explicit job permission is present and audited.                                                                 | P0       |
| AUTH-005 | Privileged/emergency access, if approved later, must be purpose-bound, time-limited, strongly authenticated, separately authorized, fully audited, alerted, and reviewed. It is unavailable by default.                                                  | Configuration and authorization tests prove no break-glass path exists until approved; enabled-path tests cover expiry, alert, review, and denial.             | P0       |
| PRIV-001 | The controller must present an approved, versioned privacy notice covering purposes, lawful basis, categories, recipients, retention criteria, rights, complaint path, controller/processor contacts, and transfers before applicable collection/access. | Content/version tests and audit evidence link the applicable notice to account/data events without assuming consent as the lawful basis.                       | P0       |
| PRIV-002 | The product must collect and expose only data necessary for approved booking/report delivery and operations; report content, patient labels, and raw identifiers are prohibited from general analytics, URLs, logs, metrics, and traces.                 | Data-flow inventory and automated/manual telemetry inspection find no prohibited values.                                                                       | P0       |
| PRIV-003 | Any use of consent must be specific, informed, unambiguous, purpose-bound, recorded, withdrawable, and separated from processing performed under another lawful basis.                                                                                   | Policy/workflow tests prove refusal/withdrawal behavior and prevent consent from being fabricated or bundled.                                                  | P0       |
| PRIV-004 | Cross-border processing or new subprocessors must remain disabled until the controller approves transfer basis, destination, safeguards, contract, risk assessment, and updated notice/register.                                                         | Deployment/config gate and vendor inventory block unapproved region/subprocessor changes.                                                                      | P0       |

## Data, API, integration, and compliance requirements

### Data requirements

| ID       | Requirement                                                                                                                                                                                                                       | Observable acceptance                                                                                                                                                                            | Priority |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| DATA-001 | Clinic, branch, staff, patient, booking, report, version, content object, lifecycle event, access event, privacy request, retention policy, and legal hold must have stable opaque identifiers and explicit ownership/provenance. | Schema and integration tests reject missing/orphaned/cross-owned relationships and client-supplied ownership changes.                                                                            | P0       |
| DATA-002 | Persistence constraints and transactions must enforce valid lifecycle transitions, immutable published version content, monotonic versioning, and at most one current available version.                                          | Migration/domain/concurrency tests reject invalid transitions, overwrite, duplicate current version, and lost update.                                                                            | P0       |
| DATA-003 | Sensitive data must be encrypted in transit and at rest, including primary storage, report objects, queues, backups, replicas, and approved exports; keys are separately managed, rotated, access-controlled, and recoverable.    | Configuration evidence, key/access tests, restore test, and security review cover every data store and transfer.                                                                                 | P0       |
| DATA-004 | Production, staging, development, and test data and credentials must be isolated. Local/test uses generated data; staging uses non-production or formally approved data; production exports are not copied down by default.       | Environment/configuration and access tests prove isolation and block production credentials/data in lower environments.                                                                          | P0       |
| DATA-005 | Report objects must be private, checksum/integrity protected, malware scanned, non-executable, and accessible only through freshly authorized delivery.                                                                           | Storage policy, scanner, checksum, tamper, URL-expiry, and response-header tests pass.                                                                                                           | P0       |
| DATA-006 | An approved retention schedule must define each data class, trigger, duration, hold, archival, deletion/anonymization method, verification, and exception; the system must enforce and evidence it.                               | Time-controlled policy tests cover expiry, hold, release, deletion, downstream copies, backups, and audit evidence. DEC-006 requires the controller-approved schedule before production release. | P0       |
| DATA-007 | Backup/restore must preserve ownership, version, encryption, audit, retention, and legal-hold invariants and must not restore withdrawn access grants or revoked credentials.                                                     | Scheduled restore exercise meets RPO/RTO and integrity/access reconciliation.                                                                                                                    | P0       |

### API and integration requirements

| ID      | Requirement                                                                                                                                                                                                                                   | Observable acceptance                                                                                                                                                      | Priority           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| API-001 | HTTP contracts are versioned under `/api/v1`, use DTOs rather than persistence entities, validate all boundary input, use consistent problem details and correlation IDs, and document authentication/authorization and pagination semantics. | OpenAPI/contract tests cover success, validation, unauthenticated, unauthorized/not-found, conflict, rate limit, payload, malware/scan, dependency, and internal failures. | P0                 |
| API-002 | State-changing requests use idempotency and concurrency preconditions; create/publish/correct/withdraw/privacy mutations are atomic and safe to retry.                                                                                        | Repeat/concurrent/failure-injection tests show one durable outcome or an explicit conflict with no partial state.                                                          | P0                 |
| API-003 | List endpoints apply authorization before parameterized server filtering, stable indexed sorting, pagination, and totals; requested page size never exceeds 50.                                                                               | Query/contract tests cover injection, invalid bounds, stable page traversal, tenant isolation, and representative query plans.                                             | P0                 |
| API-004 | Error responses and timing must minimize object-existence leakage while preserving actionable authorized staff errors and server-side diagnostic evidence.                                                                                    | Access-matrix tests compare hidden-object responses; logs correlate detail without exposing it to unauthorized clients.                                                    | P0                 |
| INT-001 | Booking integration identifies the authoritative source, contract owner, versioning, authentication, authorization, idempotency, reconciliation, downtime, and deprecation behavior before implementation.                                    | Approved contract and consumer/provider tests exist before production booking data flows.                                                                                  | P0                 |
| INT-002 | Internal report lifecycle events are durable, versioned, tenant-scoped, idempotent, observable, and free of report content; consumers cannot broaden visibility.                                                                              | Event schema/contract, replay, duplicate, ordering, and authorization tests pass.                                                                                          | P0                 |
| INT-003 | Internal concepts should be mappable to relevant FHIR `ServiceRequest`/`DiagnosticReport` and DICOM identifiers without claiming conformance; actual external interoperability requires a separately approved contract/conformance profile.   | Architecture documents mappings/gaps and prevents a proprietary field from being presented as a clinical standard.                                                         | P1                 |
| MIG-001 | No production data import/backfill may run without source inventory, mapping, lawful-purpose confirmation, validation, restartability, reconciliation, error quarantine, rollback/compensation, and deletion of temporary copies.             | A migration plan and dry-run reconciliation are release evidence whenever migration is introduced.                                                                         | P0 when applicable |

### Compliance and governance requirements

| ID      | Requirement                                                                                                                                                                                                                                                       | Observable acceptance                                                                                                              | Priority |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- |
| GOV-001 | Before real-data processing, accountable owners must approve controller/processor/subprocessor roles, processing purposes and lawful bases, data-flow/recipient inventory, transfer basis, DPO/registration/audit obligations, and contracts.                     | Signed/recorded governance evidence implements DEC-001 and is linked from privacy/security/release artifacts.                      | P0       |
| GOV-002 | A DPIA and qualified Nigeria-specific legal/privacy review must be completed before production health-data processing and revisited for material purpose, identity, hosting, integration, or data-category changes.                                               | Approved DPIA/review records risks, mitigations, residual acceptance, owner, and review date; unresolved high risk blocks release. | P0       |
| GOV-003 | A breach process must record awareness time, affected data/subjects, risk assessment, containment, evidence, controller/processor coordination, communications, and regulator/data-subject decisions, supporting the NDPA's applicable 72-hour notification duty. | Tabletop and incident workflow prove time tracking, evidence preservation, escalation, and decision authority.                     | P0       |
| GOV-004 | Clinical owners must approve which source constitutes a final report, who may publish/correct/withdraw, correction/addendum semantics, patient release timing, and safety content before production use.                                                          | Domain approval implements DEC-005 and is traced to lifecycle tests and UI content.                                                | P0       |

## Quality attributes and service objectives

### Performance and capacity

| ID       | Requirement                                                                                                                     | Measure                                                                                                                                                                                | Priority          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| PERF-001 | Administrator and patient report pages meet LCP <= 2.5 s, INP <= 200 ms, and CLS <= 0.1 at p75.                                 | Production build; cold cache; stable Chrome; 4x CPU slowdown; 1.6 Mbps down, 750 Kbps up, 150 ms RTT; representative non-production benchmark dataset; at least 30 trials per journey. | P0 initial budget |
| PERF-002 | First report page is usable within 2.5 s p75; filter/sort/page actions acknowledge within 200 ms and settle within 1 s p75.     | Clinic with 500 summaries, server pages <= 50, same controlled profile.                                                                                                                | P0 initial budget |
| PERF-003 | Report content is not transferred with lists and starts only after explicit authorized view/download.                           | Automated/browser network assertions across staff/patient lists.                                                                                                                       | P0                |
| PERF-004 | Published report becomes eligible in the owning patient's refreshed view within 60 seconds p95 without weakening authorization. | Controlled end-to-end trials plus event/queue measurements.                                                                                                                            | P0                |
| PERF-005 | The chosen list optimization has reproducible before/after evidence.                                                            | At least 30 trials each; median/p75 time, transferred bytes, DOM rows, peak memory, absolute/percentage change; virtualization only if profiling justifies it after pagination.        | P1                |
| PERF-006 | Authorization, tenant filtering, and audit paths meet the same representative workload without unindexed full-table scans.      | Database query plans and load tests use representative tenant skew and report volumes defined in delivery planning.                                                                    | P0                |

These are initial engineering budgets, not yet field-validated Nigerian SLOs.
Production targets must be revised from representative p75/p95 measurements.

### Accessibility and compatibility

| ID         | Requirement                                                                                                                                                                           | Observable acceptance                                                                                                          | Priority |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| A11Y-001   | Administrator and patient journeys target WCAG 2.2 AA, including semantics, names/roles/values, labels/instructions, errors, status announcements, contrast, and alternatives.        | Automated checks plus keyboard, zoom/reflow, and manual assistive-technology review have no unresolved critical/serious issue. | P0       |
| A11Y-002   | Every action is keyboard operable with visible focus, logical order, no trap, and managed focus/announcement after validation, conflict, mutation, dialog, and navigation.            | Complete browser journey succeeds without pointer.                                                                             | P0       |
| A11Y-003   | Content reflows without loss or two-dimensional page scrolling at 320 CSS px and 200% zoom; touch targets and orientation remain usable.                                              | Checks at 320/768/1280 CSS px, 200% zoom, portrait/landscape where supported.                                                  | P0       |
| A11Y-004   | Lifecycle and error status never relies on color or motion alone; motion respects reduced-motion; clinical copy avoids interpretation/advice and identifies support/escalation paths. | Content/design review and reduced-motion/browser tests.                                                                        | P0       |
| COMPAT-001 | Required journeys support the current and previous major versions of Chrome, Edge, Firefox, and Safari, including mobile Safari and Chrome where device access is intended.           | Recorded browser/device matrix has no unresolved P0 defect.                                                                    | P0       |

### Security and privacy engineering

| ID      | Requirement                                                                                                                                                                                                | Observable acceptance                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| SEC-001 | Zero unintended cross-clinic, cross-patient, wrong-role, hidden-state, direct-content, cache, export, or audit disclosure is a release-blocking invariant.                                                 | Full actor/object/state/action test matrix passes at API, storage-delivery, and browser layers.                | P0       |
| SEC-002 | Input/output protections cover injection, stored/reflected XSS, CSRF, SSRF, path/filename attacks, malicious PDFs, content sniffing, insecure deserialization, mass assignment, and request/payload abuse. | Security unit/integration/DAST/manual tests and secure headers pass; no unaccepted high/critical finding.      | P0       |
| SEC-003 | Secrets and keys use approved providers, are not stored in source/images/logs, have scoped access and rotation/revocation procedures, and fail closed.                                                     | Secret scan, configuration review, access/rotation/revocation tests, and incident procedure pass.              | P0       |
| SEC-004 | Rate limits and abuse detection protect sign-in, recovery, identity linking, booking search, upload, content access, and privacy/export paths without creating cross-user denial or bypass.                | Abuse/load tests cover enumeration, credential stuffing, scraping, upload exhaustion, and authorized recovery. | P0       |
| SEC-005 | Dependencies, builds, containers, and artifacts must pass the approved supply-chain policy, vulnerability threshold, provenance, and patch process before release.                                         | SBOM/scan/provenance evidence and no unaccepted exploitable critical/high issue.                               | P0       |

### Availability, resilience, and recovery

| ID      | Requirement                                                                                                                                                                                                    | Observable acceptance                                                                                                        | Priority            |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| REL-001 | Initial service availability objective is 99.9% monthly for authenticated report list/access and administrator publication, excluding pre-announced maintenance.                                               | SLI definition, external availability probes, dashboard, error-budget calculation, and alert ownership exist before release. | P0 approved default |
| REL-002 | Initial recovery objectives are RPO <= 15 minutes and RTO <= 4 hours for report metadata/content/audit.                                                                                                        | Backup schedule, restore drill, integrity/access reconciliation, measured RPO/RTO, and owner sign-off.                       | P0 approved default |
| REL-003 | Database, object storage, malware scanner, identity, booking source, event, cache, and key-provider failures produce bounded degradation, no false success, no visibility broadening, and observable recovery. | Failure-injection/resilience tests cover outage, latency, timeout, retry, partial recovery, and exhaustion.                  | P0                  |
| REL-004 | Mutations are transactional across durable state and required audit/event evidence, or use a proven recoverable pattern with no externally false completion.                                                   | Crash/failure tests at each boundary reconcile to one valid outcome.                                                         | P0                  |
| REL-005 | Capacity planning covers tenant skew, concurrent users, upload/content bandwidth, scanner queues, storage growth, audit growth, backup windows, and third-party quotas.                                        | Load/capacity tests and documented headroom/scale signals meet delivery-plan thresholds.                                     | P0                  |

### Observability, support, and operability

| ID      | Requirement                                                                                                                                                                                                                                        | Observable acceptance                                                                                           | Priority |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| OBS-001 | Logs, metrics, traces, and events correlate request/operation/outcome/duration/tenant-safe opaque references without report content, patient labels, contact data, or raw secrets.                                                                 | Telemetry schema tests and manual inspection find no prohibited data and can trace defined failures end to end. | P0       |
| OBS-002 | Dashboards/alerts cover authentication/authorization anomalies, cross-scope denials, publication/withdrawal, upload/scan failures, queue age, booking sync, API latency/errors, storage/integrity, backup/restore, and privacy/security workflows. | Alert tests route actionable signals to named owners with runbooks and avoid patient-data payloads.             | P0       |
| OPS-001 | Health/readiness endpoints distinguish process, database, object storage, scanner, identity, booking integration, and queue dependencies without exposing internals publicly.                                                                      | Health tests and deployment checks prove accurate readiness and safe public detail.                             | P0       |
| OPS-002 | Runbooks cover identity outage/takeover, wrong-patient or cross-clinic exposure, malicious upload, publication error, withdrawal, booking mismatch, storage/database failure, lost event, restore, privacy request, and breach.                    | Tabletop/smoke exercises execute each critical runbook and record gaps/owners.                                  | P0       |
| SUP-001 | Patients and clinic staff have accessible support routes that verify identity, minimize shared health data, issue a correlation reference, define severity/escalation, and never ask users to email report content or credentials.                 | Support journey/content review and tabletop prove safe triage/escalation.                                       | P0       |
| SUP-002 | Repository documentation includes exact install, focused/completion checks, run, migration, seed, backup/restore, end-to-end, and operational smoke commands.                                                                                      | A clean-workspace evaluator follows documented commands without undocumented data edits.                        | P0       |

## Journey acceptance summaries

### Administrator happy path

1. Authenticated clinic report administrator enters the assigned tenant.
2. Staff find the correct completed booking from the authoritative source.
3. Staff confirm clinic/patient/service context and upload a clinically final
   report.
4. Validation and malware scanning succeed; an immutable pending version appears
   only in authorized clinic views.
5. Staff review and publish with concurrency/idempotency protection.
6. The owning authenticated patient sees and explicitly accesses the report.
7. Staff upload and publish a corrected version; the old version is preserved
   and superseded atomically.
8. Staff withdraw the current version; patient list/content access and existing
   grants are revoked while audit/history remains.

### Required alternate and failure paths

- invalid/expired/revoked identity, missing MFA, disabled account, role change,
  and safe account recovery;
- patient-link no match, ambiguous match, mismatch, duplicate person, takeover,
  and revocation;
- wrong-clinic booking/report, wrong-patient access, hidden lifecycle state, and
  unknown direct identifier;
- booking source outage, stale/out-of-order update, duplicate source record, and
  reconciliation;
- invalid/oversized/corrupt/malicious report, scanner/storage outage,
  quarantine/rejection, duplicate upload, and cleanup;
- duplicate/stale/concurrent publish, correction, or withdrawal with no lost
  update or false success;
- report withdrawn during content access, expired access grant, interrupted
  delivery, and cache invalidation;
- database, object storage, identity, key provider, event, queue, and cache
  failure with safe retry/recovery;
- empty list, no filter matches, validation, unauthorized/not found, conflict,
  rate limit, dependency error, and accessible support/retry;
- privacy request with identity failure, legal hold, partial denial, downstream
  failure, and tracked completion;
- security/privacy incident detection, containment, evidence, assessment,
  escalation, recovery, and review.

## Traceability

| Requirement IDs                                                                       | Source                                                        | Downstream decision/evidence                                                   | Planned verification                                                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| OUT-001, FR-004–FR-007                                                                | BRIEF, IDEA, DISC, PO                                         | Booking/report contracts, lifecycle/data ADR, admin journey                    | Contract, domain, database, API, upload, event, browser tests                    |
| OUT-002, FR-001, FR-003, FR-008–FR-009, AUTH-001–AUTH-004, SEC-001                    | BRIEF, IDEA access policy, DISC identity/confidentiality risk | Identity/linking policy, tenant model, authorization policy, patient journey   | Full actor/object/state/action matrix, cache/storage and browser tests           |
| OUT-003, FR-010–FR-012, DATA-002                                                      | PO correction/withdrawal, DISC integrity risk                 | Versioning, concurrency, audit, cache/grant revocation decisions               | Transaction, concurrency, audit, direct-access/browser tests                     |
| OUT-004, FR-002, FR-012–FR-015, PRIV-001–PRIV-004, DATA-003–DATA-007, GOV-001–GOV-004 | DISC real-product boundary, NDPA                              | Governance approvals, DPIA, security/privacy/data/operations ADRs and runbooks | Privacy/security reviews, failure tests, restore, tabletop, operational evidence |
| OUT-005, FR-014, A11Y-001–A11Y-004, COMPAT-001, SUP-001                               | DISC access/connectivity risk                                 | Complete accessible journeys and support model                                 | Component, keyboard, assistive, responsive, browser, support tests               |
| OUT-006, FR-005, PERF-001–PERF-006, REL-005                                           | BRIEF and IDEA performance budget                             | Query/index/cache strategy and benchmark plan                                  | Query plans, API/load tests, controlled browser measurements                     |
| OUT-007, INT-001–INT-003, MIG-001                                                     | DISC interoperability direction, REPO boundaries              | Contract ownership, mapping/gap ADR, migration plan when applicable            | Contract/conformance/reconciliation/migration evidence                           |
| API-001–API-004, REL-003–REL-004, OBS-001–OPS-002                                     | REPO and DISC operability                                     | API/event/error/telemetry/health/recovery decisions                            | Contract, resilience, telemetry, alert, runbook and smoke evidence               |
| SEC-002–SEC-005                                                                       | DISC upload/identity/privacy risk                             | Threat model, secure delivery, secrets and supply-chain controls               | SAST/SCA/DAST/manual, secret, abuse, header, provenance evidence                 |

Downstream artifacts must add the selected design decision, implementation
slice, test-evidence location, defect/exception, and release status for each ID.
Code presence alone is not verification.

## Approved product-owner decisions

The product owner accepted all recommended defaults on 2026-08-13. These are
baseline product decisions. They do not replace the downstream domain, privacy,
security, clinical, legal, architectural, operational, or verification evidence
named in the final column.

| ID      | Decision                                                                           | Approved first-release baseline                                                                                                                                                                                                                                                             | Required downstream evidence                                                                                                                          |
| ------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEC-001 | Controller, processor, operator, support, and incident ownership                   | Each imaging center is controller for its patient/report workflow; the named healthAlst operating entity is contracted processor/operator; subprocessors are disclosed and approved.                                                                                                        | Name the legal entities and owners; approve contracts, processing register, support model, and incident responsibility before real-data processing.   |
| DEC-002 | Staff/patient identity proofing, authentication, linking, recovery, and MFA        | Staff are provisioned by verified clinic tenant admins and always use MFA; patients are linked through an approved clinic invitation plus identity verification and use MFA/step-up for report content; phone/email/booking ID alone is insufficient.                                       | Approve the identity policy/provider and verify account-linking, recovery, revocation, and takeover controls before real-data access.                 |
| DEC-003 | Authoritative booking source and eligibility state                                 | One clinic-owned booking API/event contract is authoritative; only a clinically completed booking is eligible; synchronization is idempotent and reconciled.                                                                                                                                | Approve the source owner/contract, identifiers, state mapping, reconciliation, and downtime procedure before implementation.                          |
| DEC-004 | Supported report formats and limits                                                | First release accepts clinically final PDF only, maximum 20 MiB, with signature/MIME validation, malware scanning, private encrypted storage, and explicit view/download. Structured reports and DICOM are deferred pending a clinical interoperability profile.                            | Approve scanner/storage/preview architecture, capacity, and clinic PDF policy; verify malicious-file controls.                                        |
| DEC-005 | Clinical finalization, publication, correction, withdrawal, and patient visibility | Clinical authoring/finalization occurs upstream; the clinic report administrator may attach/publish/correct/withdraw only a final report; corrections create immutable versions; patients see only the current available version; withdrawal removes access while preserving records/audit. | Obtain clinical/domain approval and trace it to lifecycle, concurrency, audit, revocation, and patient-content tests.                                 |
| DEC-006 | Retention, deletion, legal hold, and patient rights                                | No universal period is invented. The controller approves a Nigeria-specific medical-record/privacy schedule before release; healthAlst enforces versioned policies, holds, verified deletion, and rights workflows.                                                                         | Approve the per-data-class schedule and legal/privacy basis before production release and schema finalization.                                        |
| DEC-007 | Hosting, transfer, and subprocessors                                               | Keep production data in an approved jurisdiction/region with encrypted transport/storage; no cross-border transfer or new subprocessor until controller/legal approval, safeguards, contract, register, and notice are complete.                                                            | Approve region/providers, contracts, transfer safeguards, DPIA, subprocessor register, and privacy notice before production architecture is accepted. |
| DEC-008 | Minors, guardians, delegates, carers, and shared access                            | First release serves independently authorized adult patients only; do not expose reports to a delegate/guardian until age, authority, consent/lawful-basis, revocation, audit, and safety policy is approved.                                                                               | Verify age/eligibility handling and block delegated access; reopen requirements before adding vulnerable-user/delegate journeys.                      |
| DEC-009 | Availability, recovery, and support targets                                        | 99.9% monthly availability, RPO <= 15 minutes, RTO <= 4 hours, a named 24/7 security/privacy escalation, and published service-support hours for ordinary issues.                                                                                                                           | Fund/name owners and prove SLI, alert, restore, escalation, and support evidence before release readiness.                                            |

## Dependencies, assumptions, and release blockers

- The product owner is `healthalyst`; a named operating legal entity and target
  clinic are not yet evidenced.
- The administrator/patient workflow is product-owner-directed and supported by
  desk research, but not validated with a target clinic or representative users.
- The repository provides technical scaffolding only; no health-domain,
  identity, tenancy, file-storage, malware-scanning, or booking integration
  implementation exists.
- The initial performance profile is an engineering budget and must not be
  described as representative field evidence.
- Development/test fixtures must be generated and non-production; this safety
  rule does not change the requirement that the product support real production
  data in approved environments.
- No real-data processing, pilot, or production release is permitted until the
  downstream evidence required by DEC-001 through DEC-009 exists and the
  applicable experience, architecture, verification, security/privacy,
  release-readiness, release, and operations gates pass.
