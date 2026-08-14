---
sdlc_gate: requirements
status: complete
---

# Requirements Baseline

## Evidence, authority, and baseline boundary

This baseline translates the completed product charter and discovery artifact
into requirements for an **interview prototype**. It does not specify or
authorize a production health service.

Evidence used:

- **BRIEF:** the product-owner-supplied Imaging Report Dashboard interview brief;
- **IDEA:** `docs/sdlc/00-ideation.md`, including the approved scope, non-goals,
  access boundary, synthetic performance budget, and Nigeria scenario context;
- **DISC:** `docs/sdlc/01-discovery.md`, including the prototype-only build
  recommendation, evidence limitations, competing solutions, and deferred
  real-world validation;
- **REPO:** the observed Next.js, Spring Boot modular-monolith, PostgreSQL, and
  `/api/v1` scaffold described in repository documentation and source code.

No participant research, real clinic workflow, real patient data, production
identity policy, legal opinion, or usability evidence supports this baseline.
Requirements derived from scenario roles are prototype acceptance conditions,
not validated statements about users or the Nigerian market.

In this document, **must** is required for gate acceptance, **should** is a
recommended design target that may be changed with recorded rationale, and
**may** is optional. `P0` means required for the interview prototype; `P1`
means required for the performance evaluation if time permits but must not
weaken a P0 safety boundary.

This artifact is complete for product-owner review. Passing the requirements
gate records approval of the prototype defaults below; it does not authorize
implementation, production deployment, or processing of real health data.

## Product scope and prioritized outcomes

### Required outcomes

| ID | Priority | Outcome | Observable success |
|---|---|---|---|
| OUT-001 | P0 | Demonstrate the administrator report lifecycle | A simulated clinic administrator can associate synthetic report content with an eligible synthetic booking, publish it, correct it through a new version, and withdraw it. |
| OUT-002 | P0 | Demonstrate safe patient visibility | A simulated patient can access only `available` reports for that patient's own bookings; pending, withdrawn, other-patient, and other-clinic reports are not disclosed. |
| OUT-003 | P0 | Make trust boundaries inspectable | Administrator and patient journeys are visibly distinct, authorization is enforced at the server boundary, and the UI labels all identities and records as synthetic. |
| OUT-004 | P0 | Demonstrate complete interaction states | Both journeys provide loading, empty, validation, success, conflict, unavailable, unauthorized, and retry/recovery behavior where applicable. |
| OUT-005 | P1 | Demonstrate a scalable report-list decision | The administrator list handles 500 synthetic report summaries using server pagination and produces reproducible before/after performance evidence. |
| OUT-006 | P1 | Demonstrate reusable presentation boundaries | Shared report-summary and status primitives can be reused without exposing administrator actions in the patient experience. |

### In scope

- Synthetic clinics, patients, completed bookings, and imaging-report content.
- A simulated administrator context scoped to one synthetic clinic.
- A simulated patient context scoped to one synthetic patient.
- Administrator list, filter, sort, pagination, report attachment, publication,
  correction, and withdrawal.
- Patient list and explicit opening or downloading of available report content.
- PDF report content and a bounded prototype structured-text result.
- Server-enforced clinic, patient, booking, and visibility rules despite the
  deliberately simulated sign-in mechanism.
- Deterministic fixture generation and reset for evaluation and tests.
- Controlled browser performance measurement with synthetic fixtures.

### Out of scope

- Real patient, booking, clinic, report, or contact data.
- Production deployment, clinical use, diagnostic interpretation, treatment
  advice, or claims of legal, regulatory, clinical, or interoperability
  compliance.
- Creating, scheduling, rescheduling, or paying for bookings.
- Radiologist authoring workflows, DICOM image storage/viewing, FHIR or DICOMweb
  integration, referring-clinician access, delegates or carers, notifications,
  messaging, sharing, and patient comments.
- Production authentication, account recovery, consent or lawful-basis
  management, tenancy administration, support override, break-glass access,
  retention enforcement, data-subject export/deletion, breach response, and
  production audit operations.
- Import or migration of existing clinical or operational data.

Any proposal to use real data, run a real clinic pilot, integrate an external
clinical system, or deploy to production must reopen discovery and resolve the
deferred domain, legal, privacy, identity, security, and operational evidence.

## Actors, terminology, and trust boundaries

### Actors

| Actor | Prototype authority | Explicit limitation |
|---|---|---|
| Interview evaluator | Selects a documented synthetic scenario and observes or exercises the prototype | Has no implied access to real data or production controls |
| Simulated clinic administrator | Reads bookings and manages reports for exactly one selected synthetic clinic | Is not a production-authenticated staff identity and has no cross-clinic or patient-view authority |
| Simulated patient | Reads available reports for exactly one selected synthetic patient | Is not a production-authenticated patient and has no administrator or other-patient authority |
| Prototype system | Enforces object scope, lifecycle invariants, validation, and deterministic fixtures | Must not be described as production-secure, clinically integrated, or legally compliant |

### Domain terms and invariants

- A **booking** is a pre-existing synthetic imaging event owned by exactly one
  clinic and one patient. The prototype does not create or edit bookings.
- An **eligible booking** is a booking marked `completed`; reports must not be
  attached to any other booking state.
- A **report** belongs to exactly one booking and therefore inherits that
  booking's clinic and patient. These ownership links are immutable.
- A **report version** contains either one validated PDF or one bounded
  structured-text result. Content is synthetic.
- A report lifecycle is `pending -> available -> withdrawn`. A correction to an
  available report creates a new `pending` version; it never overwrites the
  available version in place.
- Publishing a correction atomically makes the new version `available` and the
  superseded version `withdrawn`. At most one version of a report may be
  `available` at a time.
- Withdrawing an available report immediately removes all patient access while
  preserving an administrator-visible history.
- Patient-facing queries behave as though pending, withdrawn, other-patient,
  and other-clinic reports do not exist.

### Trust boundaries

1. The prototype may use a role/scenario selector or fixed test accounts, but
   every request must carry a server-resolved synthetic actor context.
2. Client-side hiding is presentation only. The server must independently
   enforce role and object scope on list, detail, content, and mutation paths.
3. Report metadata, report bytes, identifiers, error details, logs, and list
   counts are all within the same disclosure boundary.
4. The UI must permanently label the environment as synthetic and non-clinical;
   it must not visually imply a real sign-in or production security guarantee.

## Functional requirements and acceptance criteria

### FR-001 — Enter a synthetic actor context

- **Source:** BRIEF, IDEA access boundary, DISC prototype limitation.
- **Actor/outcome:** The evaluator selects a documented administrator or patient
  scenario and can identify the active synthetic role and scope.
- **Precondition/trigger:** The prototype is running with seeded fixtures; the
  evaluator opens the entry experience or changes scenario.
- **Required behavior:** The system must establish the chosen actor context on
  the server, display the active role, synthetic identity, and clinic or patient
  scope, and provide a deliberate way to switch scenarios.
- **Failure/recovery:** An unknown or missing scenario must produce an
  unauthorized state with a path back to a valid scenario; it must not fall back
  to a privileged context.
- **Authorization/data:** Scenario identifiers must resolve only to seeded
  synthetic actors. The browser must not be trusted to declare arbitrary clinic
  or patient ownership.
- **Acceptance:** Automated tests prove invalid contexts are denied; browser
  verification proves the current synthetic role and scope remain visible on
  all report screens.
- **Verification:** API integration test and browser journey.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-002 — List administrator reports

- **Source:** BRIEF and OUT-001.
- **Actor/outcome:** A simulated administrator sees report summaries for the
  active clinic and can distinguish bookings without loading report files.
- **Precondition/trigger:** A valid administrator context opens the report list.
- **Required behavior:** Each row must show a synthetic booking reference,
  patient display label, imaging service, booking date, current report status,
  version, and last update. Report bytes must not be fetched with the list.
- **Failure/recovery:** Loading and dependency failures must retain the page
  shell, explain that data could not be loaded, and offer retry.
- **Authorization/data:** The result set and total count must contain only the
  active clinic's records.
- **Acceptance:** With fixtures spanning at least two clinics, every returned
  row belongs to the active clinic and network evidence shows no report-content
  request before an explicit open/download action.
- **Verification:** Repository/service integration test, API contract test, and
  browser network inspection.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-003 — Filter, sort, and paginate the administrator list

- **Source:** BRIEF, IDEA performance budget, DISC assumption 5.
- **Actor/outcome:** An administrator can navigate a 500-summary clinic dataset
  without rendering or transferring the full list.
- **Precondition/trigger:** The active clinic has seeded report summaries.
- **Required behavior:** The server must paginate at no more than 50 rows per
  page and support deterministic sorting plus filters for status, booking
  reference or patient label, and imaging service. Page, sort, and filter state
  must be representable in the URL so refresh and back/forward navigation are
  recoverable.
- **Failure/recovery:** Invalid query values must return a bounded validation
  response and the UI must offer a valid default without silently broadening
  clinic scope.
- **Authorization/data:** Filtering and totals must be computed after clinic
  scope is applied.
- **Acceptance:** A 500-row fixture never returns or renders more than 50 rows
  per page; stable sorting produces no missing or duplicate rows while paging;
  refresh restores the selected view.
- **Verification:** Repository query/integration tests and browser journey.
- **Priority/owner/status:** P0 for server pagination; P1 for recorded
  before/after evidence / QA / ready for design.

### FR-004 — Attach report content to an eligible booking

- **Source:** BRIEF, IDEA initial scope and upload risk.
- **Actor/outcome:** An administrator attaches synthetic content to the correct
  completed booking and creates a pending report version.
- **Precondition/trigger:** The administrator is scoped to the booking's clinic,
  the booking is `completed`, and no conflicting mutation is in progress.
- **Required behavior:** The administrator must confirm the booking context and
  supply exactly one content mode: a PDF up to 10 MiB, or structured text with a
  required `impression` of 1–4,000 characters and optional `findings` of up to
  10,000 characters. Success creates version 1 in `pending` state and shows a
  confirmation without publishing it.
- **Failure/recovery:** Wrong type, oversized content, empty required text,
  ineligible booking, duplicate submission, network failure, and stale booking
  state must produce a specific, actionable error. User-entered text should be
  retained after a recoverable failure; rejected file bytes must not be stored.
- **Authorization/data:** Cross-clinic booking identifiers must be treated as
  not found. Ownership is derived from the booking, never accepted from client
  fields.
- **Acceptance:** Boundary tests cover valid PDF/text, both content modes at
  once, wrong MIME/signature, size and text limits, non-completed booking,
  duplicate submission, and cross-clinic access. A newly attached version is
  absent from every patient list and detail response.
- **Verification:** Validation unit tests, database/API integration tests, and
  browser form journey.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-005 — Publish a pending report version

- **Source:** BRIEF, IDEA visibility policy, OUT-001 and OUT-002.
- **Actor/outcome:** An administrator deliberately makes a reviewed pending
  version available to its booking's patient.
- **Precondition/trigger:** The pending version belongs to the active clinic and
  the administrator confirms publication from a view that identifies booking,
  patient label, imaging service, content type, and version.
- **Required behavior:** The system must transition the version once from
  `pending` to `available`, record the event, and make it eligible for the
  owning patient's list and content access.
- **Failure/recovery:** Repeated submission must be idempotent or return the
  already-completed outcome. Stale, withdrawn, missing, or cross-clinic versions
  must not publish. A failed transaction must leave the prior state unchanged.
- **Authorization/data:** Only the administrator context for the owning clinic
  may publish.
- **Acceptance:** Integration tests prove the state transition and rollback;
  patient access becomes visible within 60 seconds at p95 in the controlled
  verification profile and remains invisible to every other patient.
- **Verification:** Transaction/integration tests and administrator-to-patient
  browser journey.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-006 — Correct a report through versioning

- **Source:** IDEA confirmed administrator correction authority and DISC
  prototype recommendation.
- **Actor/outcome:** An administrator prepares corrected synthetic content
  without silently altering what was previously available.
- **Precondition/trigger:** A report has an available version owned by the active
  clinic; the administrator starts correction and supplies a reason.
- **Required behavior:** The system must create a new pending version linked to
  the previous version, retain the reason and history, and leave the existing
  version available until the correction is explicitly published. Publishing
  the correction must atomically make it available and mark the old version
  withdrawn/superseded.
- **Failure/recovery:** Validation and transactional failures must leave the old
  available version unchanged. Concurrent correction attempts must yield one
  accepted mutation and one conflict/reload path.
- **Authorization/data:** Only the owning clinic's administrator may correct;
  patients must not see draft correction metadata or reasons.
- **Acceptance:** Tests prove immutable version content, exactly one available
  version, atomic supersession, preserved history, and no patient disclosure of
  the pending correction.
- **Verification:** Domain and database integration tests plus browser journey.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-007 — Withdraw an available report

- **Source:** IDEA product-owner decision and DISC hypothesized job.
- **Actor/outcome:** An administrator removes an incorrect or unsuitable report
  from patient access while preserving history.
- **Precondition/trigger:** An available version belongs to the active clinic;
  the administrator supplies a reason and confirms withdrawal.
- **Required behavior:** The system must atomically transition the version to
  `withdrawn`, record actor context, timestamp, and reason, and remove patient
  list, detail, and content access.
- **Failure/recovery:** A repeated withdrawal must be idempotent or return the
  completed outcome. Transaction failure must leave the version available.
- **Authorization/data:** Only the owning clinic's administrator may withdraw;
  patients must not receive the withdrawal reason or evidence that the report
  exists.
- **Acceptance:** The owning patient's subsequent list, direct-detail, and
  content requests reveal no metadata or bytes; administrator history still
  identifies the withdrawal.
- **Verification:** API/database integration tests and browser journey.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-008 — List a patient's available reports

- **Source:** BRIEF, IDEA visibility policy, OUT-002.
- **Actor/outcome:** A simulated patient sees available report summaries for
  that patient's own bookings.
- **Precondition/trigger:** A valid patient context opens results.
- **Required behavior:** The list must show only available reports and enough
  synthetic context to identify the booking and imaging service. Pending and
  withdrawn reports must not affect rows, totals, empty-state wording, or
  pagination.
- **Failure/recovery:** Loading and dependency failures must show an accessible
  retry state. A valid patient with no available reports receives a neutral
  empty state that does not reveal pending work.
- **Authorization/data:** Patient ownership and `available` status are both
  mandatory server-side predicates.
- **Acceptance:** Mixed fixtures prove that only the active patient's available
  reports appear and that list counts are unchanged by adding pending,
  withdrawn, other-patient, or other-clinic reports.
- **Verification:** Repository/API integration tests and browser journey.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-009 — Open or download an available report

- **Source:** BRIEF, IDEA delayed content-fetch rule.
- **Actor/outcome:** A patient explicitly accesses the content of an available
  report belonging to that patient's booking.
- **Precondition/trigger:** The report appears in the active patient's list and
  the patient activates open or download.
- **Required behavior:** The server must re-authorize the content request at
  access time. PDF delivery must use a safe content type and filename;
  structured text must render as text, not executable markup. The UI must show
  content type and a clear return path.
- **Failure/recovery:** If the report was withdrawn, superseded, or became
  unavailable, access must be denied without leaking its prior existence and
  the UI must return to a refreshed list. Interrupted downloads may be retried.
- **Authorization/data:** Direct URLs must not bypass actor, ownership, or
  visibility checks and must not be permanently public.
- **Acceptance:** Tests cover the owner, another patient, pending, withdrawn,
  superseded, malformed, and unknown identifiers. Browser network evidence
  proves bytes are fetched only after explicit activation.
- **Verification:** Security-focused API integration tests and browser journey.
- **Priority/owner/status:** P0 / product owner and QA / ready for design.

### FR-010 — Present complete and recoverable UI states

- **Source:** DISC prototype controls and mobile/accessibility risks.
- **Actor/outcome:** Evaluators, administrators, and patients can understand and
  recover from expected states without inspecting developer tools.
- **Precondition/trigger:** Any list, form, mutation, or content request begins,
  succeeds, returns empty, fails validation, conflicts, or loses a dependency.
- **Required behavior:** Each journey must provide distinct loading, empty,
  success, validation, unauthorized, not-found, conflict, dependency-error, and
  retry states that preserve safe user input where practical and move focus to
  meaningful feedback.
- **Failure/recovery:** A failed mutation must never display success or update
  the local list as though committed. Retry must not duplicate mutations.
- **Authorization/data:** Error text must not disclose another clinic, patient,
  booking, report, file path, query, stack trace, or secret.
- **Acceptance:** Component/browser tests exercise every applicable state;
  console and network inspection show no uncaught error during the defined
  journeys.
- **Verification:** Component tests and browser exploratory/automated journeys.
- **Priority/owner/status:** P0 / QA / ready for design.

### FR-011 — Detect stale and concurrent mutations

- **Source:** IDEA correction/withdrawal risk and requirements safety analysis.
- **Actor/outcome:** An administrator does not unknowingly overwrite a report
  state changed by another administrator session.
- **Precondition/trigger:** Two requests mutate the same report/version using
  the same previously observed state.
- **Required behavior:** Mutations must include a version or equivalent
  precondition. The first valid mutation may succeed; a stale mutation must
  receive a conflict response and the UI must prompt reload/review before retry.
- **Failure/recovery:** Automatic retry must not apply a stale publish,
  correction, or withdrawal decision.
- **Authorization/data:** Conflict responses may disclose current state only to
  an authorized administrator for the owning clinic.
- **Acceptance:** Deterministic concurrent integration tests prove no lost
  update, no duplicate version, and at most one available version.
- **Verification:** Domain/database concurrency integration test and browser
  conflict-state test.
- **Priority/owner/status:** P0 / QA / ready for architecture.

### FR-012 — Seed and reset evaluation scenarios

- **Source:** DISC prototype boundary and reproducible measurement requirement.
- **Actor/outcome:** The evaluator can begin from known synthetic states and
  repeat journeys and benchmarks.
- **Precondition/trigger:** The prototype starts in a non-production profile or
  an authorized local/test reset is invoked.
- **Required behavior:** Fixtures must include at least two clinics, two
  patients per clinic, completed and ineligible bookings, all report lifecycle
  states, PDF and structured-text content, and one clinic with 500 summaries.
  Reset must restore stable identifiers and documented scenario credentials or
  selectors.
- **Failure/recovery:** Fixture/reset capability must refuse to run in any
  production profile. Partial reset must fail visibly and be safely repeatable.
- **Authorization/data:** Fixtures must be visibly fictional and contain no
  copied or plausible real-person data.
- **Acceptance:** A repeatable automated check resets twice to the same counts,
  identifiers, ownership, and lifecycle states; production-profile tests prove
  the reset is unavailable.
- **Verification:** Fixture integration test and evaluator smoke procedure.
- **Priority/owner/status:** P0 / QA / ready for architecture.

## Roles, permissions, and trust-boundary requirements

| ID | Requirement | Acceptance and planned verification | Priority |
|---|---|---|---|
| AUTH-001 | Every report list, detail, content, create, publish, correct, and withdraw operation must require a server-resolved synthetic actor context and deny by default. | API matrix covers absent, malformed, administrator, patient, and wrong-role contexts with no permissive fallback. | P0 |
| AUTH-002 | An administrator may read bookings and reports and mutate reports only when the object's clinic equals the administrator's active clinic. | Cross-clinic list totals, direct identifiers, and mutations return no object data and change no state. | P0 |
| AUTH-003 | A patient may read only report versions whose booking patient equals the active patient and whose state is `available`. | Object-level matrix covers own/other patient, own/other clinic, and every lifecycle state for list, detail, and content. | P0 |
| AUTH-004 | Pending, withdrawn, superseded, cross-patient, and cross-clinic reports must not be distinguishable through status code detail, message, timing target, totals, identifiers, or content URLs in patient-facing behavior. | Contract and browser tests compare externally observable responses and list counts; detailed causes remain server-side only. | P0 |
| AUTH-005 | Administrator actions must never be rendered or accepted in the patient context, and patient screens must not reuse administrator components that carry mutation behavior. | Component tests and API wrong-role tests prove both presentation and server enforcement. | P0 |
| AUTH-006 | The prototype identity mechanism must be labeled simulated and must not be represented as satisfying production authentication, session, recovery, MFA, or identity-proofing requirements. | UX content review finds the label on entry and report screens; release notes retain the limitation. | P0 |

## Data, integration, and compliance requirements

| ID | Requirement | Acceptance and planned verification | Priority |
|---|---|---|---|
| DATA-001 | Only synthetic clinics, actors, patients, bookings, report metadata, PDF files, and structured text may enter the prototype dataset. | Seed-data review and automated fixture checks find no imported source or production connector; UI is labeled synthetic. | P0 |
| DATA-002 | Clinic, patient, booking, report, version, and audit relationships must be protected by persistence constraints; report ownership links are immutable; at most one report version may be available for a report. | Migration/schema tests reject orphaned, cross-owned, duplicate-available, or invalid-state data. | P0 |
| DATA-003 | Every create, publish, correction, supersession, and withdrawal must record synthetic actor context, UTC timestamp, prior/new state, report/version identifier, and supplied reason where required. Content bytes and structured clinical text must not be copied into the audit record. | Integration tests assert complete audit events and absence of report content. | P0 |
| DATA-004 | PDF input must satisfy the configured 10 MiB limit, declared media type, filename rules, and PDF signature check; structured text must satisfy FR-004 bounds and render as inert text. Rejected content must not persist. | Boundary and malicious-input tests cover extensions, MIME/signature mismatch, markup, Unicode, empty values, and size limits. | P0 |
| DATA-005 | Prototype data may be reset in local/test profiles and has no production retention, archival, legal-hold, export, correction-rights, or deletion policy. Those capabilities must not be inferred from reset behavior. | Documentation and profile tests prove the limit; any real-data proposal blocks until lifecycle policy is approved. | P0 |
| API-001 | New HTTP contracts must be versioned under `/api/v1`, use transport DTOs rather than persistence entities, validate inputs at the boundary, and return a consistent problem-details error shape with a correlation identifier. | Contract and integration tests cover success and each defined error class. | P0 |
| API-002 | Report-list APIs must apply authorization before server-side filtering, deterministic sorting, pagination, and totals; page size must default to and never exceed 50. | Query/integration tests use mixed-clinic fixtures and invalid/boundary parameters. | P0 |
| API-003 | State-changing requests must provide duplicate-submission protection and a concurrency precondition; publish, correction publication, and withdrawal must be atomic. | Repeated and concurrent integration tests prove idempotent outcomes or explicit conflicts with no partial state. | P0 |
| INT-001 | The prototype must not call or claim compatibility with a clinic booking system, EMR/EHR, FHIR endpoint, DICOMweb service, notification provider, or production identity provider. | Dependency/configuration review finds no such connector and product copy makes no interoperability claim. | P0 |
| COMP-001 | Any future external or real-data integration requires a reopened discovery gate plus approved controller/processor roles, lawful basis, DPIA/legal review, identity and tenancy policy, data flow, retention/deletion, audit, breach, and operational requirements. | Production-readiness review treats every missing item as a blocker, not a deferred launch task. | P0 |

## Quality attributes and service objectives

### Performance and capacity

| ID | Requirement | Measure and acceptance profile | Priority |
|---|---|---|---|
| PERF-001 | Administrator and patient report pages must meet LCP <= 2.5 s, INP <= 200 ms, and CLS <= 0.1 at p75. | Production build, cold cache, stable Chrome, 4x CPU slowdown, 1.6 Mbps down, 750 Kbps up, 150 ms RTT, consistent fixtures, at least 30 controlled trials per journey. | P1 |
| PERF-002 | The first administrator report page must be visible and usable within 2.5 s at p75; filter, sort, and page actions must acknowledge input within 200 ms and settle with updated results within 1 s at p75. | Same controlled profile, using a 500-summary clinic and pages of at most 50. | P1 |
| PERF-003 | Report bytes must not be transferred or rendered during list loading; content transfer starts only after an authorized explicit open/download action. | Browser network assertions for administrator and patient lists. | P0 |
| PERF-004 | The team must record a before/after comparison for the chosen list optimization using identical builds, fixtures, and profiles. | At least 30 trials each; report median and p75 task time, transferred bytes, rendered row/DOM count, peak browser memory, and absolute/percentage change. Virtualization remains optional unless profiling shows rendering is still the bottleneck after pagination. | P1 |
| PERF-005 | A successfully published version must appear in the owning patient's refreshed results within 60 seconds at p95. | Controlled end-to-end trials with no external integrations; all authorization guardrails remain in force. | P0 |

The test profile is an interview benchmark, not validated evidence of Nigerian
field conditions or a production service-level objective.

### Accessibility, responsive behavior, and content

| ID | Requirement | Acceptance and planned verification | Priority |
|---|---|---|---|
| A11Y-001 | Defined administrator and patient journeys must meet WCAG 2.2 AA as the prototype conformance target, including semantic names/roles, labels, instructions, errors, status announcements, and contrast. | Automated accessibility checks plus keyboard and manual screen-reader-oriented inspection record no unresolved critical or serious issue. | P0 |
| A11Y-002 | Every function must be operable by keyboard alone with visible focus, logical focus order, no keyboard trap, and focus moved or announced after validation, mutation, modal, and route changes. | Browser journey exercises all controls without a pointer. | P0 |
| A11Y-003 | Content must reflow without loss of information or two-dimensional page scrolling at 320 CSS px width and at 200% browser zoom; targets must remain usable on touch layouts. | Browser checks at 320, 768, and 1280 CSS px and at 200% zoom. | P0 |
| A11Y-004 | Status must never be communicated by color alone; pending, available, and withdrawn labels must use plain language. Patient content must avoid implying interpretation or medical advice and must identify the report as synthetic. | Design/content review and component tests. | P0 |
| A11Y-005 | Motion must not be required to understand state and must respect `prefers-reduced-motion`; loading indicators must have text or an accessible name. | Reduced-motion and accessibility browser checks. | P0 |

### Security, privacy, resilience, and observability

| ID | Requirement | Acceptance and planned verification | Priority |
|---|---|---|---|
| SEC-001 | Automated authorization tests must produce zero cross-clinic, cross-patient, pending, withdrawn, or wrong-role disclosures across list, detail, content, totals, and mutation paths. | Full actor/object/state access matrix is a release-blocking test suite. | P0 |
| SEC-002 | User-controlled filenames and structured text must be encoded on output; report responses must set safe content type/disposition and must not permit executable upload content. | Security-focused boundary tests and response-header inspection. | P0 |
| SEC-003 | Logs, errors, telemetry, and correlation context must exclude report bytes, structured report text, patient display labels, and raw booking/report identifiers where a synthetic opaque reference suffices. | Automated log assertions where practical plus manual telemetry review. | P0 |
| RES-001 | Every mutation must be transactional: validation, persistence, audit recording, and lifecycle transition either complete together or leave the prior durable state unchanged. | Failure-injection integration tests cover create, publish, correction publication, and withdrawal. | P0 |
| RES-002 | Dependency failure must return a bounded service-unavailable response and a recoverable UI state; retries must not duplicate committed mutations. | API and browser tests exercise database/API unavailability and recovery. | P0 |
| OBS-001 | API failures and state mutations must carry a correlation identifier; mutation logs must include operation, outcome, duration, and synthetic opaque actor/object references without report content. | Integration/log inspection correlates browser-visible errors to server evidence. | P0 |
| OBS-002 | The prototype must expose existing platform health separately from report workflow errors and must make failed dependency diagnosis possible without revealing data to users. | Health/integration test and operator-oriented log review. | P0 |

### Compatibility and supportability

| ID | Requirement | Acceptance and planned verification | Priority |
|---|---|---|---|
| UX-001 | The required journeys must work in the current stable Chrome used for evaluation; material layout or interaction failure in current Firefox, Safari, or Edge must be recorded before release-readiness review. | Browser matrix is recorded during verification; Chrome is the P0 execution target. | P0 |
| SUP-001 | The repository must document exact install, focused check, completion check, run, seed/reset, and end-to-end commands before implementation is considered complete. | A clean-workspace evaluator follows the documented commands without undocumented manual data edits. | P0 |
| SUP-002 | The prototype must include a short evaluator guide naming the synthetic scenarios, expected lifecycle path, performance procedure, and all non-production limitations. | Documentation review and evaluator smoke run. | P0 |

No production availability, throughput, recovery-time, recovery-point, retention,
support-response, or on-call objective is established for this prototype.

## Journey acceptance summaries

### Administrator happy path

1. Enter a labeled synthetic administrator context for clinic A.
2. View only clinic A's paginated report queue.
3. Locate a completed booking and attach a valid PDF or structured result.
4. Observe the new version as `pending`; verify it is absent as patient A.
5. Review and publish the version.
6. Switch to patient A and open the newly available result.
7. Return as the administrator, create and publish a correction, and observe the
   original version preserved as superseded.
8. Withdraw the current version and verify patient access disappears.

### Required alternate and failure paths

- Patient with no available reports receives a neutral empty state.
- Administrator list with no matching filter receives a filter-specific empty
  state and a clear reset action.
- Invalid/oversized upload and invalid structured text are rejected without a
  persisted report.
- Wrong-clinic administrator and wrong-patient direct identifiers reveal no
  protected object and cause no mutation.
- Pending and withdrawn report identifiers reveal no patient-facing metadata,
  totals, or bytes.
- Duplicate publish/withdraw requests do not duplicate events or corrupt state.
- Concurrent stale actions produce a conflict and require review.
- API/database unavailability produces a retryable state with no false success.
- Interrupted content access can be retried only after fresh authorization.

## Traceability

| Requirement IDs | Source evidence | Planned design/architecture output | Planned verification |
|---|---|---|---|
| OUT-001, FR-002–FR-007 | BRIEF; IDEA scope and administrator authority; DISC prototype recommendation | Administrator journey, report lifecycle, versioning and persistence decisions | Domain, API, database, and administrator browser tests |
| OUT-002, FR-008–FR-009, AUTH-001–AUTH-005, SEC-001 | BRIEF; IDEA visibility policy; DISC confidentiality findings | Patient journey, authorization policy, content-delivery decision | Actor/object/state access matrix and patient browser tests |
| OUT-003, FR-001, AUTH-006, DATA-001, INT-001, COMP-001 | DISC prototype boundary and missing production evidence | Prototype identity/scenario decision and persistent non-production labeling | Config/content review and production-profile negative tests |
| OUT-004, FR-010, RES-001–RES-002 | DISC required states and operational-risk evidence | Experience state model and transaction/error contracts | Component, failure-injection, API, and browser tests |
| OUT-005, FR-003, PERF-001–PERF-005 | BRIEF; IDEA performance budget; DISC assumption 5 | Pagination/query design and performance-test plan | Query tests, browser network evidence, and controlled measurements |
| OUT-006, AUTH-005 | BRIEF reuse/boundary priority; REPO frontend module rules | Shared safe primitives plus role-specific feature components | Component dependency review and role journey tests |
| FR-004, DATA-002–DATA-004, API-001–API-003 | IDEA upload, integrity, and concurrency risks; REPO API/data constraints | Validation, schema, storage, error, idempotency, and concurrency ADRs/contracts | Boundary, migration, contract, transaction, and concurrency tests |
| FR-011, DATA-003, OBS-001 | IDEA correction/withdrawal risk | Version/precondition and audit-event design | Concurrent mutation and audit integration tests |
| FR-012, DATA-005, SUP-001–SUP-002 | DISC reproducibility and synthetic-only boundary | Seed/reset mechanism and evaluator guide | Deterministic reset and clean-workspace smoke test |
| A11Y-001–A11Y-005, UX-001 | DISC mobile, connectivity, comprehension, and exclusion risks | Accessible responsive journeys and content decisions | Automated and manual accessibility/browser evidence |
| SEC-002–SEC-003, OBS-002 | IDEA upload/privacy risks; REPO platform behavior | Safe delivery, error, logging, and health decisions | Security boundary, response-header, log, and health tests |

Downstream artifacts must extend this mapping with the chosen design decision,
implementation slice, test evidence location, and release status. A requirement
may not be marked verified merely because it appears in code.

## Assumptions, dependencies, and unresolved decisions

### Prototype defaults approved by passing this gate

- Exactly one synthetic clinic scope is active per administrator context and one
  synthetic patient scope per patient context.
- Eligible bookings are pre-seeded `completed` bookings.
- Supported content is PDF up to 10 MiB or the bounded structured-text form in
  FR-004; this is a prototype choice, not a clinical interoperability model.
- Correction uses immutable versions; the prior version remains available until
  the correction is explicitly published, then is atomically superseded.
- Withdrawal removes all patient visibility but preserves administrator history.
- Server pagination precedes optional virtualization and caps pages at 50 rows.
- Current stable Chrome is the controlled evaluation browser; WCAG 2.2 AA is the
  accessibility target.

### Decisions intentionally deferred to experience design or architecture

| Decision | Owner/gate | Constraint carried forward |
|---|---|---|
| Exact navigation, responsive layouts, wording, confirmations, focus behavior, and role-switch interaction | UX/product designer, experience-design | Must satisfy the complete states, synthetic labeling, responsive, and accessibility requirements above |
| Scenario-context mechanism and session representation | Architect/security, architecture | Must be server-resolved, deny by default, unavailable as a production-auth claim, and replaceable by real identity later |
| API resource shapes, idempotency mechanism, concurrency token, and problem-detail fields | Architect, architecture | Must preserve API-001–API-003 and all object-level authorization behavior |
| Relational schema, constraint strategy, indexes, audit representation, and file-storage adapter | Architect/database/security, architecture | Must preserve ownership, immutable versions, single-available invariant, transactions, and no public file URL |
| PDF preview versus download presentation | UX/architect, experience-design and architecture | Must fetch only after explicit authorization and remain keyboard/mobile accessible |
| Exact reusable component boundary and performance instrumentation | UX/frontend/QA, experience-design and delivery-planning | Must preserve role separation and reproducible measures |

### Production blockers, not prototype requirements

The following remain unresolved and block any real-data pilot or production
release: target clinic and patient validation; buyer and operating owner;
controller/processor allocation; lawful basis and privacy notice; DPIA and
qualified Nigeria-specific legal review; real authentication, identity proofing,
MFA, account recovery, clinic tenancy, support and emergency access; clinical
authoring and release authority; source-system integration; malware scanning and
file-storage operations; consent, retention, correction, export, deletion, and
legal hold; key and secret management; security testing; backup/restore,
availability, incident, breach, support, and on-call processes; representative
accessibility/usability and Nigerian device/network evidence.

These blockers do not prevent design of the defined synthetic interview
prototype. They must not be silently converted into implementation assumptions.
