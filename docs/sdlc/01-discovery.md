---
sdlc_gate: discovery
status: complete
---

# Product Discovery

## Corrected product boundary

On 2026-08-13, the product owner corrected a material interpretation from the
prior lifecycle cycle: healthAlst is a **real product** for real imaging centers,
staff, patients, bookings, and imaging reports. The fact that the work is being
evaluated as an interview task describes the delivery context; it does not make
the product, data model, persistence, authorization, privacy, security, or
operational requirements fictional.

This correction supersedes the archived cycle-1 description of a
synthetic-only, non-production prototype. Cycle 1 remains preserved under
`.ai/sdlc/history/cycle-1-20260813T133620Z` as historical evidence and must not
be used as the current product boundary.

The distinction carried forward is:

- the product is designed to operate with real clinics, authenticated staff,
  authenticated patients, real bookings, and real health records;
- local development, automated tests, demonstrations, and performance
  benchmarks must use clearly non-production test data unless an approved,
  protected environment and lawful data-use process exist; and
- processing real health data or releasing to production still requires the
  approved identity, tenancy, privacy, security, retention, audit, recovery,
  and operational controls defined by later gates. An interview deadline is not
  a waiver of those controls.

## Evidence status and limitations

### Reported evidence

- The product owner supplied an Imaging Report Dashboard brief: authorized
  imaging-center administrators associate reports or results with patient
  bookings and control when patients may view them.
- The product owner confirmed that administrators control upload, publication,
  correction, and withdrawal.
- The product owner confirmed Nigeria as the initial country and identified
  frontend performance, reusable components, and a clear administrator/patient
  boundary as evaluation priorities.
- The product owner confirmed that the product and its data flows are intended
  to be real, not a fake-data product.

### Observed evidence

- The repository is a working Next.js, Spring Boot modular-monolith, and
  PostgreSQL scaffold with a versioned platform-status path.
- The repository deliberately contains no imaging, patient, booking,
  authentication, or tenancy domain implementation yet.
- The architecture guide requires authorization, privacy, retention, and audit
  requirements before health-data, authentication, and tenancy modules are
  added.

### External evidence

- The official [Nigeria Data Protection Act 2023](https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf)
  applies to personal-data processing in Nigeria and to processing data subjects
  in Nigeria. It establishes processing principles and lawful-basis,
  transparency, DPIA, controller/processor, sensitive-data, data-subject-rights,
  security, breach, cross-border-transfer, and registration obligations.
- The NDPC identifies the
  [General Application and Implementation Directive 2025](https://ndpc.gov.ng/)
  as the current implementation companion to the Act. The organization must
  determine its applicable registration, DPO, DPIA, compliance-audit, and
  cross-border duties with qualified advice; this discovery is not a legal
  determination.
- The Federal Tertiary Hospital Lokoja
  [Patients' Bill of Rights](https://fmclokoja.gov.ng/patients-and-visitors/patients-bill-of-right)
  identifies privacy and confidentiality of medical records as patient rights.
- The Federal Ministry of Health and Social Welfare describes Nigeria's current
  digital-health direction as an interoperable national backbone with health
  information exchange and shared registries, rather than isolated data silos
  ([NDHI update](https://health.gov.ng/fg-rallies-stakeholders-to-build-national-digital-health-backbone/)).
- Published radiology-portal research from other health systems supports
  potential value from patient access, but also reports comprehension, anxiety,
  and mobile technical risks. It is transferable risk evidence, not validation
  of this product's Nigerian users.

### Missing evidence

No interview, contextual observation, workflow map, support-log analysis,
operational dataset, usability study, target-clinic integration inventory,
buyer commitment, or representative patient/staff research has been supplied.
The product owner previously stated that research participants are unavailable.
Consequently, the target workflow below remains a product-owner-directed model
supported by desk research, not a verified account of a named clinic.

## Decision, users, and affected actors

### Discovery decision

Decide whether a real, booking-linked imaging-report product has a sufficiently
bounded first release to proceed to requirements, while identifying the evidence
and controls that must block production if unresolved.

### Decision makers and operators

- **Accountable product owner:** `healthalyst`, responsible for value, scope,
  priority, and requirements approval.
- **Initial domain representative:** `healthalyst`; an independent imaging-center
  representative is still needed.
- **Expected buyer/controller:** an imaging center or clinic organization. The
  actual contracting, data-controller, and operating model is unconfirmed.
- **Expected product operator/processor:** the healthAlst operating organization.
  Its legal identity, hosting role, support model, and processor/subprocessor
  chain remain unconfirmed.

### Primary users

- **Imaging-center administrator or authorized staff:** finds a completed
  booking, associates the correct final report, controls patient visibility,
  corrects or withdraws mistakes, and manages a high-volume report queue.
- **Patient:** authenticates, finds available results for that patient's own
  bookings, and safely views or downloads the result.

### Affected actors requiring later validation

- radiologists or other report authors and clinical release authorities;
- referring clinicians and care teams;
- clinic owners, privacy/compliance staff, records managers, and support staff;
- patient delegates, carers, parents or guardians, and users lacking legal
  capacity;
- incident responders, infrastructure operators, subprocessors, auditors, and
  regulators.

These actors are not optional in a production operating model even when their
interfaces are outside the first product slice.

## Problem and jobs to be done

### Problem hypothesis

Imaging results need a reliable, timely, and confidential path from the center
that owns the booking/report workflow to the correct patient. Staff must avoid
wrong-booking, wrong-patient, premature-publication, and stale-report errors
while managing a potentially large queue. Patients must find available results
without unnecessary travel or support contact and without learning anything
about another patient or an unreleased report.

The problem is credible because health-report confidentiality is legally and
clinically material, digital result access already exists in comparable
products, and public Nigerian evidence identifies fragmented health information
and uneven connectivity. The frequency, severity, cost, and current workaround
at a target imaging center remain unmeasured.

### Jobs

- When a report has completed its clinical release process, authorized center
  staff need to associate it with the correct booking and make it available to
  the correct patient with an accountable history.
- When waiting for a result, an authenticated patient needs to determine whether
  it is available and access the correct report securely on the devices and
  networks available to them.
- When a published report is incorrect, incomplete, or superseded, authorized
  staff need to correct or withdraw it without erasing history or leaving an
  unsafe copy accessible.
- When operating the service, the clinic and product operator need to detect,
  investigate, contain, recover from, and evidence access, integrity, privacy,
  upload, and availability failures.

## Current and target journey

### Current journey

The current journey for a target clinic is unknown. Physical collection,
telephone follow-up, email or messaging, delivery through a referring
clinician, an existing booking system, or an existing patient portal are all
plausible. No claim about current delay, error rate, support cost, or patient
preference is validated.

### Target journey hypothesis

1. A booking is created and completed in an authoritative booking workflow.
2. A report is authored and clinically approved in an authoritative clinical
   workflow outside or upstream of the dashboard.
3. An authenticated, authorized clinic staff member finds the correct booking
   within that clinic's tenant and attaches or imports the approved report.
4. The report remains `pending` and invisible to the patient until an authorized
   publication decision succeeds.
5. The authenticated patient sees only `available` reports belonging to that
   patient's bookings and explicitly opens or downloads one.
6. Authorized staff may correct or withdraw a report through an auditable,
   concurrency-safe lifecycle; patient access changes consistently.
7. Authorized operators can investigate access, mutation, malware, delivery,
   and dependency events without exposing report content through logs.

### Journey unknowns

- authoritative booking and report sources, identifiers, and reconciliation;
- clinical approval versus administrative publication authority;
- staff roles within and across clinic branches;
- patient identity proofing, booking matching, minors, guardians, delegates,
  recovery, MFA, and lost-device behavior;
- supported formats, digital signatures, file sizes, malware scanning, content
  preview, download, storage, encryption, and key ownership;
- correction, addendum, supersession, withdrawal, notification, acknowledgment,
  and medical-record retention policy;
- downtime, reconciliation, support, incident, breach, export, deletion, legal
  hold, and cross-border processing procedures;
- actual volumes, device/network conditions, accessibility and language needs,
  and acceptable operational service levels.

## Alternatives and product position

| Alternative                                     | Evidence and implication                                                                                                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extend an existing booking or patient portal    | May reduce new identity, support, integration, and privacy risk; must be compared before creating another account and data silo.                                                               |
| Imaging-specific portal                         | Products such as PocketHealth already provide report/image access, sharing, terminology help, and family access; basic online access is not a differentiator.                                  |
| Nigerian diagnostic-center or laboratory portal | Local providers advertise online results, readiness alerts, history, sharing, or identity checks; healthAlst needs a workflow, safety, integration, usability, cost, or performance advantage. |
| Referring-clinician delivery                    | May preserve clinical explanation but can add delay and exclude patients seeking direct access.                                                                                                |
| Physical collection, phone, email, or messaging | May fit some clinics but creates travel, support, confidentiality, authenticity, or version-control risks that must be measured rather than assumed.                                           |
| Process improvement without new software        | May solve staff handoff errors at lower cost and remains a valid comparison.                                                                                                                   |
| Do nothing                                      | Avoids implementation risk but retains any current delay, disclosure, version, or support problems once those are measured.                                                                    |

The defensible position is not novelty. It is a clinic-operated,
booking-linked, auditable report lifecycle with safe patient access and strong
performance on realistic devices and networks. That position remains a
hypothesis until tested with target organizations and users.

## Riskiest assumptions and ethical evidence plan

| Priority | Assumption                                                                         | Consequence / uncertainty     | Smallest ethical evidence                                                                                                                                                                 | Decision signal                                                                                           |
| -------- | ---------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1        | A target clinic has a recurring, material report-delivery problem                  | Very high / unresolved        | Interview and observe authorized staff; review non-identifying process maps, aggregate timings, error/support themes, and channel volumes                                                 | Continue if delay, mis-association, access failure, or support cost is recurring and material             |
| 2        | Patients need and can safely use direct digital access                             | Very high / unresolved        | Consent-based interviews and usability tests across device, connectivity, disability, language, literacy, age, and assisted-use needs                                                     | Revise if direct access causes comprehension, exclusion, or safety harm that the design cannot mitigate   |
| 3        | A new product is better than extending an existing system or improving process     | High / unresolved             | Map the target clinic's booking, report-authoring, identity, portal, and support systems; compare integration, extension, replacement, and no-build cost/risk                             | Stop or reposition if an existing route meets the job more safely and cheaply                             |
| 4        | Booking-to-report association and publication authority can be made safe           | Very high / unresolved policy | Obtain clinic policy and domain review; prototype the authorization and report lifecycle using test data; threat-model wrong-patient and premature-release paths                          | Block production if ownership, release authority, correction, audit, and reconciliation cannot be bounded |
| 5        | The intended processing has a lawful and operable Nigeria-specific model           | Very high / unresolved        | Identify controller/processors, purposes, lawful basis, recipients, hosting/transfers, retention, rights, children/delegates, DPO/registration status; complete DPIA and qualified review | Block real-data processing until accountable owners approve the model and required filings/controls       |
| 6        | A 500-report clinic list and the adopted network profile represent meaningful load | Medium / unvalidated          | Obtain aggregate volumes and field conditions; benchmark the real architecture with non-production data using a reproducible profile                                                      | Revise the capacity and performance budget from measured p75/p95 evidence                                 |
| 7        | The service can be operated safely and sustainably                                 | High / unresolved             | Name buyer/operator/support/incident owners; cost storage, scanning, delivery, observability, backup, recovery, and compliance operations                                                 | Block release without funded ownership, recovery, monitoring, support, and incident capability            |

### Research safeguards

- Discovery interviews and workflow evidence must avoid collecting patient
  reports, names, contacts, booking identifiers, or other health information
  unless an approved research protocol, lawful basis, privacy notice, access
  controls, and retention/deletion process exist.
- Participant consent, recording, compensation, withdrawal, and safeguarding
  arrangements must be defined before research.
- Operational artifacts should be blank, fabricated, redacted, or aggregate
  wherever possible.
- Direct observation, participant report, product-owner decision, public-source
  fact, and inference must remain separately labeled.
- Software tests must use generated or approved non-production datasets; this is
  a development safeguard, not a statement that production data is fake.

## Success, failure, and stop signals

### Product outcomes to baseline in requirements

- time from clinically ready report to successful patient availability;
- percentage of intended available reports accessed by the correct patient;
- administrator task time and error rate for association, publication,
  correction, and withdrawal;
- wrong-booking, cross-clinic, cross-patient, premature-release, stale-version,
  and unauthorized-content events;
- patient and staff completion, abandonment, support contact, comprehension, and
  accessibility outcomes;
- report-list and content-access performance at representative clinic volumes,
  devices, and networks;
- availability, durability, recovery, malware, delivery, privacy, and incident
  outcomes needed to operate the real service.

The ideation benchmark of 500 report summaries, server pages of at most 50,
LCP <= 2.5 seconds, INP <= 200 milliseconds, CLS <= 0.1, and publication
visibility within 60 seconds at p95 remains an initial engineering budget. It
must be revised when representative field and production measurements exist.

### Stop or revise signals

- the target clinic cannot evidence a recurring problem worth solving;
- an existing system or process solves the job with lower safety, privacy,
  integration, and operating risk;
- correct patient/clinic identity, report ownership, or clinical publication
  authority cannot be established reliably;
- the controller/processor, lawful-basis, DPIA, retention, rights, hosting,
  transfer, or breach model cannot be approved;
- patients cannot access or understand results without unacceptable exclusion or
  clinical harm;
- the service cannot meet confidentiality, integrity, availability, recovery,
  performance, or sustainable operating-cost thresholds.

## Findings and recommendation

### Supported findings

- The product owner has authorized a real imaging-report product direction and
  a real administrator/patient boundary.
- The repository can support a full-stack implementation but currently contains
  no health-domain behavior and therefore provides no product validation.
- Health/report data is sensitive, confidentiality and patient rights are
  material, and Nigeria-specific privacy/security obligations must shape the
  product before real-data processing.
- Nigeria's digital-health direction favors interoperable infrastructure and
  shared registries; a closed, isolated report model would create strategic and
  integration risk.
- Comparable products establish technical feasibility and user expectations but
  also weaken novelty as a value proposition.
- Direct participant and target-clinic evidence remains absent.

### Rejected interpretations

- **Rejected:** an interview task makes the product or production data model
  fictional.
- **Rejected:** using safe test fixtures in development means the real product
  is a fake-data product.
- **Rejected:** frontend role switching or hidden controls are sufficient
  authorization for real health data.
- **Rejected:** successful implementation or synthetic performance tests prove
  market demand, real-world usability, compliance, or operational readiness.
- **Rejected:** report access alone is a differentiated proposition.

### Recommendation

**Build — a real-product MVP, with production release blocked by evidence and
control gates.** Proceed to requirements for the real administrator and patient
workflows, real persistence, server-enforced authentication/authorization and
clinic tenancy, auditable report lifecycle, secure file handling, privacy and
data-subject lifecycle, accessibility, performance, resilience, observability,
backup/recovery, and support/incident behavior.

Requirements must distinguish three environments without weakening the product:

1. development/test uses generated non-production data and replaceable local
   identity providers;
2. staging uses production-like controls and non-production or formally approved
   data; and
3. production may process real data only after all legal, organizational,
   security, privacy, clinical, and operational release conditions pass.

The absence of direct research remains a material product risk. It does not make
the application fictional, but it limits claims about demand, workflow fit, and
usability. Product-owner approval of this discovery authorizes requirements work
under that explicit risk; it does not authorize production or waive later
security, privacy, verification, or release gates.
