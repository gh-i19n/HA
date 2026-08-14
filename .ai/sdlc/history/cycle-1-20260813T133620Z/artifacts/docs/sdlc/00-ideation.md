---
sdlc_gate: ideation
status: complete
---

# Product Charter

## Evidence status

- **Observed repository evidence:** healthAlst is currently a full-stack product
  scaffold with a Next.js client, Spring Boot modular monolith, PostgreSQL, and a
  platform-status path that demonstrates connectivity.
- **Observed repository constraint:** existing product documentation deliberately
  avoids assuming clinical, insurance, billing, or wellness workflows before
  those workflows are validated.
- **Reported product direction:** the user supplied an Imaging Report Dashboard
  brief on 2026-08-13. Imaging-center administrators upload reports or results
  against patient bookings; patients view their own results after the center
  makes them available. The brief prioritizes report-list performance,
  reusable components, and a clear administrator/patient boundary.
- **Evidence limitation:** the brief establishes desired scope, but no direct
  observation, interview, workflow data, or baseline performance measurement
  has yet been supplied. The user entered `_` when asked for supporting workflow
  evidence, which is recorded as no evidence supplied. `healthalyst` is acting as
  the initial domain representative, but independent user/domain evidence is
  still needed during discovery.
- **Ideation implication:** the technical scaffold is an implementation asset,
  while the user brief is the current source of product intent. The underlying
  problem and value assumptions still require discovery evidence.

## Problem and opportunity

The proposed problem is that imaging results need a reliable, timely path from
an imaging center to the patient booking they belong to. Center staff need to
associate a report with the correct booking and control when it becomes visible;
patients need to find and view only their own available results without waiting
on a slow, unwieldy report history.

This is a product-owner hypothesis derived from the supplied task brief, not a
validated account of the current workflow. Discovery must establish how centers
and patients exchange results today, the frequency and consequences of delay or
mis-association, the alternatives already used, and whether a dashboard is the
most appropriate intervention.

## Product vision and intended users

For imaging-center staff who need to deliver results tied to completed bookings,
and patients waiting to access those results, healthAlst aims to provide a fast,
controlled report handoff in which staff publish the correct report and each
patient can access only their own available results.

Initial users and actors are:

- **Imaging-center administrator or authorized staff member:** associates a
  report file or structured result with a patient booking and controls its
  pending/available status.
- **Patient:** views their own results after those results become available.
- **Affected but undefined actors:** radiologists or other report authors,
  referring clinicians, clinic administrators, support personnel, privacy or
  compliance personnel, and any person assisting a patient. Their involvement
  and decision rights must be investigated rather than assumed.
- **Buyer and operating owner:** not specified.

## Business outcome and success measures

The intended outcome is a timely and trustworthy digital handoff of imaging
reports, with a responsive experience even when a clinic manages hundreds of
reports. The task also asks for before-and-after load-time measurement if
pagination or virtualization is implemented.

The user confirmed the evaluation priorities as frontend performance decisions,
component reusability, and clarity of the administrator/patient view boundary.
These qualitative acceptance priorities are supplemented by the measurable
performance budget below.

### Recommended performance budget

The product owner asked for the best recommendation on 2026-08-13. The adopted
ideation budget is:

- **Representative scale:** a clinic with 500 report summaries; the initial list
  displays at most 50 summaries per server-paginated page. Report files are not
  fetched until an authorized user explicitly opens or downloads one.
- **Test profile:** production build, cold cache, consistent seeded data, current
  stable Chrome, 4x CPU slowdown, and a constrained mobile-network profile of
  1.6 Mbps download, 750 Kbps upload, and 150 ms round-trip latency. Discovery
  must validate whether this is representative for intended Nigerian users.
- **Page experience at p75:** Largest Contentful Paint at or below 2.5 seconds,
  Interaction to Next Paint at or below 200 milliseconds, and Cumulative Layout
  Shift at or below 0.1 for both the administrator list and patient results view.
- **List tasks at p75:** the first report page is visible and usable within 2.5
  seconds of navigation; filter, sort, and page actions acknowledge input within
  200 milliseconds and settle with updated results within 1 second.
- **Publication outcome:** an authorized patient's results view reflects a
  successfully published report within 60 seconds at p95 during verification.
- **Safety guardrails:** zero cross-patient or cross-clinic disclosures in
  automated authorization tests, and no report metadata or file is exposed while
  its visibility is `pending`.
- **Measurement:** run at least 30 controlled trials before and after the chosen
  list optimization using the same production build profile and fixtures. Report
  median and p75 task time, transferred bytes, rendered row/DOM count, and peak
  browser memory, including absolute and percentage changes. Treat
  virtualization as optional unless profiling shows page rendering remains the
  bottleneck after server pagination.

The Core Web Vitals values use the current official
[Web Vitals “good” thresholds](https://web.dev/articles/vitals) and recommended
75th-percentile assessment method. The task-specific dataset, network profile,
list timings, publication timing, and safety guardrails are healthAlst product
recommendations and must be revisited when representative field evidence
becomes available.

Additional outcome measures to refine during discovery include:

- time from report readiness to successful patient access;
- percentage of available reports successfully accessed by the correct patient;
- staff time and error rate when attaching and publishing a report;
- report-list load/render time under the adopted performance budget;
- privacy or authorization incidents, incorrect associations, and report
  corrections or withdrawals;
- patient and staff task-completion or abandonment rates.

A stop signal should cover failure to demonstrate a real workflow improvement,
inability to protect report confidentiality and integrity, or performance that
does not meet the agreed target on representative hardware and networks.

## Scope, non-goals, constraints, and assumptions

### Ideation scope

- An administrator-facing interface for authorized imaging-center staff to
  select a booking, upload a report file or enter supported structured results,
  and set or observe `pending`/`available` visibility.
- A patient-facing results view limited to the authenticated patient's own
  bookings and available results.
- A backend association among booking, uploaded report or structured result,
  owning clinic/patient, and visibility state.
- A reusable component boundary that keeps administrator actions separate from
  patient presentation while sharing safe primitives where appropriate.
- A report-list strategy that remains responsive at hundreds of reports per
  clinic; pagination or virtualization and measured impact are a stretch goal.

### Confirmed initial non-goals

- Creating, scheduling, rescheduling, or paying for the underlying booking.
- Authoring or clinically interpreting an imaging report beyond storing and
  presenting approved file or structured-result formats.
- Diagnostic decision support, treatment advice, or automated clinical claims.
- Referring-clinician workflows, patient messaging, and report notifications
  unless discovery establishes them as essential to the initial handoff.
- Processing real health data before identity, clinic tenancy, authorization,
  consent or other lawful basis, audit, retention, correction, withdrawal, and
  deletion requirements are approved.

The user confirmed these non-goals on 2026-08-13.

### Initial access and visibility policy

- The user assigned upload, publish, correction, and withdrawal control to the
  imaging-center administrator for the initial scope.
- Consistent with the original brief, a patient may view only reports belonging
  to their own booking and only while the report is `available`.
- `pending` reports must not be disclosed to the patient, including through list
  metadata, counts, identifiers, or direct file URLs.
- Administrator scope across clinics, the authentication mechanism, correction
  history, withdrawal behavior, and emergency/support access remain discovery
  and requirements questions.

### Confirmed implementation constraints

- The current repository is a pnpm/Turborepo and Next.js frontend beside a Java
  21 Spring Boot modular monolith backed by PostgreSQL.
- The architecture documentation requires health-data, authentication, and
  tenancy requirements to be defined before corresponding modules are added.
- These assets constrain later delivery choices but do not determine the product
  problem or prove product viability.

### Unvalidated assumptions

- Imaging centers have an existing booking identifier that reliably identifies
  the patient, clinic, and imaging event.
- Authorized center staff know when a report is ready for patient visibility and
  may reverse or correct that decision safely.
- Patients can be strongly authenticated and matched to bookings without exposing
  another patient's report or revealing report existence.
- File and structured-result formats, sizes, malware controls, preview/download
  behavior, retention, and audit needs can be bounded.
- Hundreds of reports per clinic is a representative scale, and report-list
  rendering is a material performance risk relative to network, query, file, and
  authorization costs.
- A software dashboard improves the current workflow more than process change,
  an existing portal, direct delivery, or doing nothing.
- Patients and staff have sufficient device access, connectivity, ability, and
  trust, including accessible and assisted-use paths.
- A sustainable buyer, funding route, and operating owner exist.

### Launch context

- **Initial country:** Nigeria, as specified by the user.
- Applicable Nigerian privacy, health-data, clinical, records-retention,
  accessibility, hosting/transfer, and breach obligations require authoritative
  research before requirements and architecture are approved.

## Accountable owner and decision rights

- **Accountable product owner:** `healthalyst`.
- **Domain/user representative:** `healthalyst` for the initial ideation scope.
- **Identity note:** the user confirmed that `healthalyst` acts in both roles;
  whether the identifier names an individual, team, or organization can be
  refined during discovery.
- **Ideation approval:** the product-owner role may approve this completed
  charter and authorize progression to discovery.
- **Reserved user authority:** only the user may waive lifecycle gates, approve
  the release gate, or authorize production changes.

`healthalyst`, acting as product owner, holds the ideation decisions for product
scope, success measures, funding priority, risk acceptance, and whether
discovery should proceed.

## Initial risks and evidence needed

| Risk or uncertainty | Current basis | Next evidence needed |
|---|---|---|
| Problem severity and current workflow are unvalidated | User supplied the desired solution and workflow but entered `_` for supporting evidence | Imaging-center and patient workflow evidence during discovery |
| Independent domain evidence and viability are undefined | `healthalyst` owns both product and domain-representative roles for ideation; no independent representative, buyer, funding model, or operating model was named | Imaging-center and patient evidence, buyer hypothesis, and operating owner during discovery |
| Wrong-patient or cross-clinic disclosure | Reports are sensitive and tied to bookings | Initial identity, tenancy, authorization, association, and audit policy |
| Premature or incorrect visibility | Only `pending` and `available` were specified | Authority to publish, correction/withdrawal rules, concurrency expectations, and patient communication policy |
| Unsafe or malicious uploads | File type, size, origin, and scanning rules are unspecified | Supported formats and limits, validation/scanning approach, storage and download policy |
| Performance profile may not represent Nigerian users | A measurable 500-report budget is adopted, but no field device/network evidence exists | Validate the profile with intended users and preserve before/after measurements |
| Health-data lifecycle is undefined | Purpose and report content are known only at a high level | Jurisdiction, lawful basis/consent, minimization, retention, deletion, export, and breach obligations |
| Solution anchoring may bias discovery | A dashboard and technical scaffold already exist | Comparison with current process, existing portals, direct delivery, and doing nothing |
| Exclusion and accessibility risk is unknown | No research about patient or staff capabilities | Accessibility, language, connectivity, device, literacy, disability, and assisted-use evidence |

### Ideation conclusion and next evidence

- The user confirmed `healthalyst` as both accountable product owner and initial
  domain/user representative.
- The user confirmed that administrators may withdraw an already-available
  report; withdrawal behavior and audit history require detailed requirements.
- The product direction, intended users, initial scope, non-goals, access
  boundary, launch context, measurable outcome, constraints, and key risks are
  sufficiently bounded to begin discovery.
- The problem remains a hypothesis. No direct workflow evidence was supplied,
  so discovery must collect or document imaging-center and patient evidence,
  compare realistic alternatives, validate the Nigeria-specific context and
  performance profile, and produce a build/revise/stop recommendation.

**Recommendation:** approve ideation and proceed to discovery. Do not advance
from discovery to requirements until the core problem and user workflow are
supported by evidence or the user explicitly waives that gate.
