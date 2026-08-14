---
sdlc_gate: discovery
status: complete
---

# Product Discovery

## Evidence status and constraint

- On 2026-08-13, the product owner stated that no real research participants are
  available.
- On 2026-08-13, the product owner clarified that this initiative is an
  **interview prototype project**, not a production health service or a claim of
  validated market demand.
- No interview, observation, diary, survey, support-log, workflow-analytics, or
  usability evidence has been supplied.
- The product brief and product-owner decisions are **reported intent**, not
  validation of user behavior, problem severity, demand, or usability.
- Repository contents are **observed technical evidence** about the current
  scaffold, not evidence that imaging centers or patients need the proposed
  dashboard.
- Model-generated actors, journeys, and assumptions below are planning aids and
  must not be represented as research findings.

## Prototype decision boundary

The decision for this lifecycle cycle is whether to build a bounded prototype
that demonstrates the supplied task, not whether to launch a health product in
Nigeria. The interview task brief is authoritative evidence of the prototype's
required behavior and evaluation criteria. It does not validate the scenario as
a commercial opportunity or a real clinic workflow.

The prototype will therefore:

- use synthetic bookings, patients, clinics, and reports only;
- demonstrate distinct imaging-center administrator and patient result views;
- demonstrate booking/report/status association and the `pending` to
  `available` lifecycle without claiming clinical-system interoperability;
- prioritize report-list performance, reusable components, and a clear
  administrator/patient boundary, including measured pagination or
  virtualization evidence where feasible; and
- remain non-production, with no real patient data, clinical use, production
  deployment, or regulatory-compliance claim.

Nigeria remains a scenario and design context. Any move toward a real pilot,
real health data, external clinical integration, or production release requires
fresh domain/user evidence and reopening the earliest affected lifecycle gate.

## Actors, users, and jobs to be done

### Hypothesized actors

- **Interview evaluator:** needs to assess the implementation against the
  supplied functional and frontend-performance criteria using a credible,
  inspectable prototype.
- **Imaging-center administrator:** needs to associate the correct report with
  the correct booking, control patient visibility, correct mistakes, and manage
  a large report queue efficiently.
- **Patient:** needs to know whether a result is available and securely access
  only their own result on a usable device and network.
- **Affected actors requiring investigation:** report authors or radiologists,
  referring clinicians, clinic management, support staff, privacy/compliance
  staff, patient carers or delegates, and the product operator.

### Hypothesized jobs

- When a result is ready, authorized center staff need to attach it to the
  correct booking and make it available without exposing the wrong patient's
  information.
- When waiting for a result, a patient needs to determine whether it is ready and
  access it without unnecessary travel, calls, or disclosure to another person.
- When a published result is wrong or superseded, authorized staff need to
  withdraw or correct it while preserving an accountable history.

The evaluator need and acceptance focus come directly from the supplied task.
The administrator, patient, and affected-domain actors are scenario roles; none
of their real-world needs or jobs has been validated with an independent user or
domain source.

## Current journey and pain points

The current journey is unknown. The following is a hypothesis derived only from
the proposed solution:

1. A patient has an existing imaging booking.
2. Imaging is performed and a report is produced outside the proposed dashboard.
3. Authorized staff locate the booking and attach a file or structured result.
4. The report remains `pending` until an administrator publishes it.
5. The authenticated patient views the `available` report.
6. An administrator may later correct or withdraw it.

Unknowns include the actual booking source, report-authoring system, handoff
steps, existing delivery channel, readiness decision, identity checks, clinic
volume, delay, error frequency, patient notification, correction practice,
support burden, accessibility needs, device/network conditions, and the cost of
doing nothing. No pain point or frequency claim is currently validated.

## Research evidence and competing solutions

### Evidence available

| Source | Evidence type | What it supports | Limitation |
|---|---|---|---|
| Product-owner task brief | Authoritative prototype brief | Required scenario roles, workflow, scope, and evaluation priorities | Validates the interview deliverable, not current behavior, demand, severity, or adoption |
| Completed ideation charter | Product decision record | Approved hypothesis, non-goals, access boundary, Nigeria context, and performance budget | Carries the same missing user evidence |
| Repository documentation and code | Observed technical evidence | A Next.js/Spring Boot/PostgreSQL scaffold and deliberate absence of health-domain modules | Does not validate product value or workflows |
| Nigerian government and regulator publications reviewed 2026-08-13 | Authoritative desk evidence | Applicable privacy/health-record constraints, digital-health direction, and national connectivity context | Does not validate a specific clinic or patient journey |
| Peer-reviewed portal and radiology literature reviewed 2026-08-13 | Published research from other settings | Known benefits, comprehension/anxiety risks, access patterns, and implementation barriers | Populations and health systems are not representative of healthAlst's intended Nigerian users |
| First-party portal documentation reviewed 2026-08-13 | Market/alternative evidence | Existing result-delivery capabilities and solution patterns | Vendor claims are not independent outcome evidence |
| Real participants | None | Nothing yet | Product owner reports that participants are unavailable |

### Desk-research findings: Nigeria context

1. The [Nigeria Data Protection Act 2023](https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf)
   classifies health-status data as sensitive personal data. It requires fair,
   lawful, transparent, purpose-limited, minimal, accurate, retention-limited,
   and secure processing; appropriate technical and organisational security;
   privacy information for data subjects; and a DPIA before processing likely to
   create high risk. It also establishes data-subject rights, processor
   obligations, cross-border-transfer conditions, and breach duties, including
   Commission notification within 72 hours where the statutory risk threshold is
   met.
2. The NDPC's final
   [General Application and Implementation Directive 2025](https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf)
   operationalises the Act. Registration category, Data Protection Officer,
   audit-return, DPIA filing, and cross-border obligations must be assessed for
   the actual clinic/operator structure and processing scale; this discovery does
   not provide legal advice or a compliance determination.
3. The National Health Act 2014 treats user health information as confidential
   and restricts disclosure. An official federal hospital's
   [Patients' Bill of Rights](https://fmclokoja.gov.ng/patients-and-visitors/patients-bill-of-right)
   likewise identifies privacy and confidentiality of medical records as a
   patient right. The product therefore needs an explicit controller/processor
   model, lawful disclosure policy, and access-control responsibility before real
   data is used.
4. The Federal Ministry of Health and Social Welfare reports that Nigerian health
   data remains fragmented, only a small number of institutions use EMR/EHR
   platforms, and many still use paper processes. Its current direction is a
   national interoperable digital-health architecture, shared health records,
   registries, and health-information exchange rather than isolated silos
   ([NDHI announcement](https://health.gov.ng/fg-inaugurates-committee-on-digital-in-health-initiative/),
   [2025 implementation update](https://health.gov.ng/inaugural-address-by-dr-iziaq-adekunle-salako-the-honourable-minister-of-state-for-health-and-social-welfare-delivered-at-the-2nd-day-of-2025-joint-annual-review-meeting-jar/)).
5. Connectivity cannot be treated as universal. The National Bureau of
   Statistics' 2023/24 household panel reported mobile-phone access for about
   two-thirds of people aged 10 or older, internet access for about one in five,
   strong urban/rural differences, and frequent power outages
   ([GHS-Panel Wave 5](https://www.nigerianstat.gov.ng/pdfuploads/GHS-Panel%20Wave%205%20-%20Survey%20Report.pdf)).
   ITU's 2024 dashboard reports higher but still incomplete access: 41.2% of
   individuals using the internet and 69.5% owning a mobile phone
   ([ITU Nigeria data](https://datahub.itu.int/data/?Governance=Collaborative+regulation&Sustainability=e-Applications&e=NGA)).
   The differing measures and populations reinforce, rather than remove, the
   need to validate target users. Mobile-first, low-transfer, resilient behavior
   is a justified design hypothesis, not a validated requirement.

### Desk-research findings: user value and risk

- A 2025 systematic review of 33 studies found that patients consistently wanted
  access to radiology reports; reported benefits included understanding,
  empowerment, and patient-clinician engagement, while disadvantages included
  difficulty understanding reports and anxiety
  ([Journal of the American College of Radiology](https://www.sciencedirect.com/science/article/pii/S1546144024006975)).
- A retrospective academic-center study found that, among radiology reports that
  patients did access through a portal, about 48% were viewed within 72 hours of
  release. This supports timeliness as measurable but does not establish demand
  in Nigeria
  ([JMIR study](https://pmc.ncbi.nlm.nih.gov/articles/PMC6625217/)).
- A survey of people viewing their radiology images online found high reported
  satisfaction but also technical difficulties in 26.7% of responses, with the
  highest incidence on smartphones. That makes responsive and low-friction
  patient access a safety and inclusion concern, not merely polish
  ([JMIR Formative Research](https://formative.jmir.org/2022/4/e29496)).
- A Lagos cross-sectional study of 293 physicians and nurses found positive
  attitudes toward EMR but reported major barriers including insufficient
  computers, inconsistent power, system failures, and poor internet. The study
  concerns hospital EMR rather than imaging-center portals, so it supports
  operational-risk hypotheses rather than the proposed journey
  ([published article](https://pmc.ncbi.nlm.nih.gov/articles/PMC12573650/)).

### Desk-research findings: existing alternatives

| Alternative | First-party evidence | Implication for healthAlst |
|---|---|---|
| General patient portal | [Epic MyChart](https://www.mychart.org/l/en-us/help/test-results/) exposes available results, comments, notifications, trends, and PDF downloads | Adding results to an existing patient/booking portal may be lower risk than creating another account and silo |
| Imaging-specific portal | [PocketHealth](https://www.pockethealth.com/patients/) provides released images/reports, identity confirmation, sharing, terminology help, follow-up prompts, and family access | Report access alone is not differentiating; understanding, delegation, sharing, and integration are established expectations but remain outside initial scope unless validated |
| Nigerian diagnostic-center portal | [Philips Diagnostic Centre](https://philipsdiagnosticcentre.com/) describes online booking, secure portal delivery, email/SMS readiness notifications, consultation, and physical collection | A local center already advertises the proposed basic journey; healthAlst needs evidence for a workflow or performance gap |
| Nigerian multi-provider results portal | [SYNLAB Nigeria PathProvider](https://www.synlab.com.ng/path-provider/) describes result history, device access, readiness alerts, clinician access, sharing, and identity verification | History, notification, professional access, and recovery/support are realistic competing capabilities |
| Process-only alternatives | Physical pickup, referring-clinician delivery, phone support, or secure enhancement of an existing booking system | These may solve the initial job with lower implementation and privacy risk and must remain in the comparison |

The market evidence rejects novelty as a value proposition. The narrower
hypothesis worth testing is whether a booking-linked, clinic-operated report
lifecycle can be safer, faster, simpler, or less costly than the clinic's
current portal or handoff process.

### Standards and integration feasibility

- The official [HL7 FHIR DiagnosticReport](https://hl7.org/fhir/diagnosticreport.html)
  model supports a patient subject, link to the diagnostic request, report status,
  structured observations, imaging-study references, and an attached formatted
  report such as PDF. The related ServiceRequest represents the diagnostic order.
- [DICOMweb](https://www.dicomstandard.org/using/dicomweb) defines RESTful query,
  retrieve, and store services for imaging objects.

These standards show credible integration patterns and argue against inventing a
closed report format. They do not determine the repository's eventual contract,
prove interoperability with a target center, or authorize implementation during
discovery. The brief currently asks for reports/results, not diagnostic image
viewing; DICOM image storage or viewing remains out of scope unless validated.

### Alternatives to compare through desk research

- physical report collection;
- telephone follow-up or staff-mediated delivery;
- email or messaging applications;
- delivery through a referring clinician;
- an existing imaging, hospital, or patient portal;
- adding secure delivery to the existing booking system;
- process improvement without new software;
- doing nothing.

Public product pages, policies, standards, case studies, and published research
may show that alternatives exist and expose relevant risks. They cannot establish
that the proposed users experience this problem or would adopt healthAlst.

### Evidence that can be gathered without participants

1. Review authoritative Nigerian sources for privacy, health-data, records,
   accessibility, hosting/transfer, consent or other lawful basis, and breach
   obligations. This informs constraints, not demand.
2. Review first-party documentation for existing portals and delivery channels
   to compare capabilities, workflow assumptions, and gaps without treating
   marketing claims as user evidence.
3. If the product owner can supply non-identifying artifacts, review blank forms,
   process maps, policies, aggregate report volumes, anonymized support themes,
   or aggregate timing/error data. Do not accept real patient reports or personal
   data for discovery.
4. Build only disposable technical experiments needed to test high-risk
   feasibility or performance assumptions. Synthetic-data benchmarks cannot
   validate the user problem or usability.

## Riskiest assumptions and experiments

| Priority | Assumption | Consequence / uncertainty | Smallest ethical test available now | Decision signal |
|---|---|---|---|---|
| 1 | Imaging centers and patients experience a material report-delivery problem | Very high / unresolved | Seek non-identifying workflow evidence or published primary research; recruit participants when feasible | Continue only if evidence shows recurring delay, error, access, or support cost |
| 2 | A new dashboard is preferable to existing portals or process changes | High / weakened by alternatives | Obtain a target clinic's current-system map and compare integration, extension, and replacement | Revise or stop if an existing route solves the job with lower risk/cost |
| 3 | Booking-to-report association and publication authority can be made safe | Very high / feasibility supported, policy unresolved | Use FHIR/DICOM concepts to inform—not dictate—a provisional authorization, correction, and integration policy | Stop before real data if controller, ownership, identity, or audit rules cannot be bounded |
| 4 | A future Nigerian real-data service could lawfully support the intended health-data lifecycle | Very high / outside prototype scope | Before any real-data pilot, complete a DPIA and qualified Nigeria-specific legal/compliance review after controller, processors, hosting, and data flows are known | Do not leave prototype scope if purpose, disclosure, transfer, retention, rights, or security obligations cannot be met |
| 5 | The 500-report performance profile is a useful interview benchmark | Medium / accepted for prototype evaluation, not field-representative | Run the supplied synthetic benchmark and report its environment and limitations | Meet or revise the prototype budget based on controlled measurements; do not generalize results to clinics |
| 6 | Patients and staff can use the experience accessibly on available devices and networks | High / public evidence shows material risk | Standards-based accessibility review, mobile-first prototype evaluation, and later representative usability testing | Do not claim usability until representative validation occurs |

### Research safeguards

- Do not collect real reports, booking identifiers, patient names, contact
  details, or other health information for discovery.
- If participants become available, define consent, recording, compensation,
  privacy, retention, and withdrawal arrangements before research begins.
- Separate direct observations, participant reports, public-source facts,
  product-owner decisions, and inference in all notes.
- Record search scope, source dates, sample limits, and contradictory evidence.

## Validated findings and rejected assumptions

### Validated findings

- The repository can host frontend and backend work and intentionally contains no
  imaging-domain implementation yet.
- The product owner has approved an imaging-report-dashboard prototype,
  administrator/patient boundary, Nigeria scenario context, initial non-goals,
  and a synthetic performance budget for an interview evaluation.
- The supplied interview task validates the prototype objective: demonstrate
  the requested workflow, scalable component architecture, and frontend
  performance decisions. It does not validate production demand.
- Nigerian authoritative sources establish that health information is sensitive
  and confidential, high-risk processing and security obligations are material,
  and national digital-health policy is moving toward interoperable shared
  infrastructure.
- Government and published evidence supports a broader Nigerian problem of
  fragmented/paper health information and operational constraints involving
  connectivity, power, equipment, and system reliability.
- Existing Nigerian and international portals already provide online result
  access, notifications, history, sharing, or interpretation support. The basic
  concept is feasible but not novel.
- Published studies from other health systems support both potential value from
  timely patient access and credible risks involving comprehension, anxiety,
  mobile technical difficulty, and follow-up burden.
- No independent user or domain validation exists.

### Rejected assumptions

- **Rejected:** an approved task brief is equivalent to validated user demand.
- **Rejected:** model-generated journeys or personas count as participant
  evidence.
- **Rejected:** a successful synthetic performance test would prove the product
  is useful or usable in the field.
- **Rejected:** putting imaging reports online is, by itself, a differentiated
  product proposition.
- **Rejected:** the application should invent a proprietary clinical report or
  imaging format before integration needs are known.

### Still unknown

- Actual target centers and patients, current journey, frequency, severity,
  workarounds, willingness to adopt or pay, buyer and operational ownership,
  source booking/report systems, controller/processor roles, lawful basis,
  representative performance conditions, and whether a new dashboard is better
  than integration or process change.

## Product recommendation

**Recommendation: `build` — interview prototype only.** Proceed to requirements
for a bounded, synthetic-data demonstration of the booking-linked report
lifecycle. This recommendation is supported by the explicit interview brief,
the repository's technical feasibility, established standards, and the user's
decision to proceed without real participants. It is not a recommendation to
launch, pilot with patients, or process health information.

The requirements baseline must preserve these controls:

- synthetic data only and no production deployment;
- explicit separation between simulated prototype authorization and the
  server-enforced authorization a real service would require;
- complete admin and patient scenario states, including loading, empty, error,
  pending, available, correction, and withdrawal where retained in scope;
- a reusable report-list architecture and reproducible performance measurement
  against the approved synthetic workload;
- no claim of clinical validity, legal compliance, real-world usability,
  interoperability, product-market fit, or representative Nigerian performance;
  and
- clear deferred work for identity, access policy, integration, clinical
  governance, DPIA/legal review, security verification, representative usability
  research, and operational readiness.

The missing participant evidence is a known limit on any production conclusion,
but it does not block the defined interview deliverable because the evaluator's
problem and acceptance focus are supplied directly in the task. If the scope
changes toward a real clinic or patient use, discovery must be reopened and the
missing evidence resolved before continuing.
