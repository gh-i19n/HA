---
sdlc_gate: experience-design
status: draft
---

# Experience Design

## Gate status and evidence boundary

This artifact turns the approved cycle-2 requirements into an
implementation-ready experience specification for the real healthAlst product.
The interview is an evaluation context; clinic, staff, patient, booking, report,
identity, privacy, and operational journeys are designed as real product
journeys.

Evidence used:

- the approved product discovery in `docs/sdlc/01-discovery.md`;
- the approved requirements and decisions in
  `docs/sdlc/02-requirements.md`;
- the observed frontend scaffold, which currently provides only a platform
  status page, a shared `StatusBadge`, and a small color-token foundation; and
- expert UX and accessibility review recorded below.

No representative staff or patient usability session, assistive-technology
user session, interactive prototype test, or Figma design exists yet. The text
wireframes in this document are design evidence, not real-user validation. The
gate remains `draft` until the validation plan is executed and material findings
are resolved or explicitly accepted by an accountable approver.

## Experience principles

| ID     | Principle                                                         | Design consequence                                                                                                                                                                                                                      |
| ------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| XD-001 | Identity and scope are always clear                               | Every protected staff screen identifies the active clinic and signed-in staff member; every patient screen identifies the signed-in patient without revealing sensitive data on public surfaces. Production has no role-switch control. |
| XD-002 | Correct association before speed                                  | Booking, patient, imaging service, and report context are reviewed before upload and again before publication; bulk publish is not part of the first release.                                                                           |
| XD-003 | Patient visibility is deliberate                                  | Upload never implies publication. `Pending` is a staff concept and is never shown or counted for patients.                                                                                                                              |
| XD-004 | Destructive change is reversible in understanding, not in history | Correction and withdrawal explain consequences before confirmation; content versions and audit history are never silently overwritten.                                                                                                  |
| XD-005 | Minimum necessary information                                     | Lists show only task-relevant identifiers; contact details, report narrative, and report bytes are progressively disclosed only when authorized and needed.                                                                             |
| XD-006 | Calm, literal health content                                      | Labels describe operational state without interpreting clinical meaning, predicting outcomes, or using urgency that has not been supplied by the issuing clinic.                                                                        |
| XD-007 | Recovery is part of the primary path                              | Loading, empty, invalid, unauthorized, conflict, delayed, unavailable, and support states are designed alongside success.                                                                                                               |
| XD-008 | Accessibility is structural                                       | Native semantics, keyboard order, focus, announcements, contrast, reflow, touch, and reduced motion are specified before visual polish.                                                                                                 |
| XD-009 | Real product, safe design evidence                                | Research and development use approved non-production scenarios; production experiences are designed for real records and approved environments.                                                                                         |

## Primary actors and end-to-end journeys

### Clinic report administrator

#### Journey A — Upload and publish a report

1. **Entry:** Staff sign in through the approved identity provider, complete
   MFA, and enter the clinic workspace for their assigned tenant.
2. **Orientation:** The page header shows clinic name, branch when applicable,
   signed-in name, role, and a sign-out/account menu. The report queue is the
   default destination.
3. **Find booking:** Staff search by booking reference or patient display name,
   then refine by imaging service/date. Results are already tenant-scoped.
4. **Verify context:** Staff open a booking summary showing booking reference,
   patient display name plus a second approved disambiguator, imaging service,
   service date, completion state, and report history.
5. **Select content:** Staff choose a PDF through a labeled file control. The
   interface shows the approved 20 MiB limit and PDF-only rule before selection.
6. **Validate:** Client validation catches obvious type/size errors, but the UI
   states that server validation and safety checking are authoritative.
7. **Upload:** A determinate upload status is shown when progress is known.
   Cancel is available only while cancellation is safe. Navigation-away warning
   applies while unsaved/upload work could be lost.
8. **Safety processing:** The screen changes to `Checking file`. Staff may leave
   and return; the queue shows the durable processing state. The interface does
   not promise that the report is safe or published before the server confirms.
9. **Pending review:** On success, the report detail shows `Pending review`,
   filename, file size, upload time, uploader, checksum-safe reference, booking
   context, and a `Review publication` action. The patient cannot see it.
10. **Publication review:** Staff see a confirmation page/dialog with booking,
    patient, service, report version, and a clear consequence: the patient will
    be able to access this report after publication.
11. **Commit:** Staff activate `Make available to patient` once. The control is
    disabled while the request is pending and cannot be double submitted.
12. **Confirmation:** Success appears only after durable commit. Focus moves to
    a status heading, an assertive announcement confirms availability, and the
    queue/detail show `Available to patient`, publication time, and actor.
13. **Return:** Staff can return to the same queue filters/page or view lifecycle
    history.

#### Journey B — Correct and supersede a report

1. Staff open the current available version and choose `Upload correction` from
   an actions menu separated from ordinary viewing.
2. The correction page explains that the current report remains available until
   the new version is checked, reviewed, and explicitly published.
3. Staff select an approved correction reason/category and upload the corrected
   clinically final PDF through the same validation/safety pipeline.
4. The detail view presents version lineage: current available version and new
   pending correction. Patients see only the current available version.
5. Publication review states that publishing version N will replace patient
   access to version N-1 while preserving history.
6. On success, version N is `Available to patient`, N-1 is `Superseded`, focus
   moves to confirmation, and the history records both events.
7. If another staff member changed the report, a conflict page explains what
   changed, preserves the uncommitted reason/file reference when safe, and
   requires `Review latest report`; it never auto-applies a stale decision.

#### Journey C — Withdraw patient access

1. Staff open the current available report and choose `Withdraw patient access`.
2. A dedicated destructive confirmation identifies the report and patient,
   requires an approved reason, and explains that patient list/view/download
   access will stop while the medical/audit record remains.
3. The primary action is labeled `Withdraw patient access`; `Keep available` is
   the safe cancel action and receives initial focus only when that follows the
   established dialog pattern.
4. During commit, both actions are disabled and a status is announced.
5. Success is shown only after durable revocation. The detail status becomes
   `Withdrawn`; patient content grants and cached access are no longer usable.
6. Failure leaves the previous visible status unchanged and provides a safe
   retry or conflict review path.

### Patient

#### Journey D — Find and access an available report

1. **Entry:** The patient signs in through the approved identity flow, completes
   required verification/MFA, and enters the patient portal.
2. **Orientation:** The default `Imaging results` page explains that it contains
   reports made available by issuing imaging centers. It does not promise that
   all expected or pending reports are shown.
3. **List:** Available reports are ordered newest service date first, with clinic,
   imaging service, service date, report date, and a single `View report` action.
   Report files are not fetched with the list.
4. **Open:** The patient selects a report. If step-up authentication is required,
   the return target is preserved without exposing report identifiers in public
   copy.
5. **Review context:** The report page identifies the issuing clinic, imaging
   service, service/report dates, file type, size, and accessibility/support
   options before loading content.
6. **Access:** `Open report` or `Download PDF` starts a freshly authorized
   request. The page never frames the report as good/bad, normal/abnormal, or a
   diagnosis.
7. **Support:** Adjacent content says: `Questions about what this report means?
Contact the imaging center that issued it.` The support route never asks the
   patient to email the report or credentials.
8. **Return:** Back navigation returns to the preserved patient list position.

#### Journey E — No result, unavailable report, and access recovery

- If there are no available results, the neutral empty state is `No imaging
results are available in your account.` It does not mention pending counts,
  expected reports, or hidden records.
- If a direct report request is unknown, withdrawn, superseded, or unauthorized,
  the patient receives the same safe state: `This report is not available.` The
  next actions are `Return to imaging results` and `Get help`.
- If a session expires before content access, the patient reauthenticates and
  returns to the report only after the server rechecks access.
- If identity linking is missing or ambiguous, report access remains blocked.
  Recovery explains the identity-verification process without revealing matched
  clinics, bookings, or reports.

### Secondary actors

#### Clinic tenant administrator — team access

1. Enter the tenant-scoped `Team and access` area without report-content access.
2. List named staff, role, status, MFA/enrollment status when policy permits,
   last access summary, and effective clinic/branch scope.
3. Invite/provision staff through the approved identity flow; assign only
   documented roles.
4. Review role changes and suspension/revocation in a confirmation step.
5. Show successful effective time and session-revocation state; conflicts require
   refresh/review.
6. Prevent removal of the last valid tenant administrator and provide the
   approved recovery path.

#### Privacy/records operator — rights request

1. Receive a verified request reference without exposing broad patient data in
   the queue.
2. Review identity evidence, request type, scope, deadlines, legal/medical-record
   holds, and required approvals.
3. Generate a scoped preview of actions/exports, then require dual approval for
   broad export, restriction, or deletion where policy requires it.
4. Track partial completion, downstream failure, hold, denial rationale,
   communication, and appeal/complaint path.
5. Finish only when durable audit/reconciliation evidence exists.

#### Patient or staff — support

1. Open support from the relevant error/account/report context.
2. See safe self-help first, including correlation reference when available.
3. Choose a contact route with service hours and security/privacy escalation
   information.
4. Confirm identity through the approved support process; never paste/upload a
   report or share a password/MFA code in ordinary support.

## Information architecture and navigation

### Separate product shells

The first release uses separate, role-specific shells. Production does not use a
demo-style role switcher.

#### Clinic workspace

- **Reports** — default report queue and report details.
- **Bookings** — scoped lookup used to start report attachment; not scheduling.
- **Team and access** — visible only to tenant administrators.
- **Privacy requests** — visible only to approved privacy/records roles.
- **Support** — role-aware support and service status.
- **Account menu** — signed-in identity, clinic/branch scope, session/security,
  and sign out.

#### Patient portal

- **Imaging results** — default and primary destination.
- **Account and privacy** — identity/account information, privacy notice, and
  request entry.
- **Support** — access, identity, report-availability, and security help.
- **Account menu** — signed-in identity, session/security, and sign out.

### Orientation and route behavior

- Each page has one visible `h1`, a persistent product/role header, and a
  breadcrumb only when hierarchy adds information beyond browser back.
- Deep links require authentication and authorization before protected page
  content or metadata appears.
- After sign-in, users return only to a validated role-appropriate destination.
- Back/forward/refresh preserve safe list filter, sort, page, and scroll state.
- Patient/staff pages are never placed in shared public/browser caches.
- Route titles avoid patient names, booking references, report filenames, or
  clinical content.

### Screen inventory and traceability

| Screen ID | Surface                              | Purpose                                                    | Primary requirements                |
| --------- | ------------------------------------ | ---------------------------------------------------------- | ----------------------------------- |
| AUTH-01   | Sign in/MFA                          | Authenticate and return to a validated destination         | FR-001, DEC-002, AUTH-001           |
| AUTH-02   | Account recovery/identity resolution | Recover without account or report enumeration              | FR-001, FR-003, SEC-004             |
| ADM-01    | Report queue                         | Find/filter/page clinic report summaries                   | FR-005, PERF-001–PERF-003, API-003  |
| ADM-02    | Booking lookup/detail                | Confirm eligible booking and ownership context             | FR-004, DEC-003, AUTH-002           |
| ADM-03    | Upload and safety processing         | Select PDF, upload, validate, scan, and recover            | FR-006, DEC-004, DATA-005, SEC-002  |
| ADM-04    | Report detail/history                | Review version, lifecycle, actors, and permitted actions   | FR-007, FR-010–FR-012               |
| ADM-05    | Publication review                   | Confirm patient visibility before publish/supersession     | FR-007, FR-010, API-002             |
| ADM-06    | Withdrawal confirmation              | Explain/reason/confirm patient-access revocation           | FR-011, DEC-005                     |
| TEAM-01   | Team and access                      | Provision, role-change, suspend, and recover tenant staff  | FR-002, AUTH-004                    |
| PAT-01    | Imaging results                      | List only available reports for verified patient           | FR-008, AUTH-003, PERF-001–PERF-003 |
| PAT-02    | Report context                       | Orient before content access and offer support             | FR-009, SUP-001                     |
| PAT-03    | Report viewer/download               | Freshly authorize and deliver PDF                          | FR-009, DATA-005, SEC-001           |
| PAT-04    | Safe unavailable state               | Recover without revealing hidden report existence          | FR-008, FR-009, API-004             |
| PRIV-01   | Privacy request entry/status         | Submit and track applicable rights requests                | FR-013, PRIV-001–PRIV-003           |
| PRIV-02   | Privacy operations                   | Review, approve, execute, reconcile, and evidence requests | FR-013, DATA-006, GOV-001–GOV-002   |
| SUP-01    | Support and service status           | Safe self-help, escalation, and correlation                | FR-014, SUP-001, OBS-001            |

## Interaction model and content hierarchy

### Report queue

- The heading and summary state the active clinic and result count without
  patient data in the browser title.
- Search is a labeled text input with an explicit submit action; typing does not
  trigger uncontrolled requests. Filters have visible labels and active-filter
  chips with individual removal plus `Clear all`.
- Default sort is newest relevant update first. Sort control announces the
  selected field/direction and is URL-backed.
- Desktop uses a semantic data table with a caption and sortable column buttons.
  The row itself is not a click target; a named `View report for [service/date]`
  link is provided.
- Narrow layouts use a semantic list of report cards rather than a visually
  rearranged table. Each card keeps booking, patient, service, date, status, and
  action in the same reading order.
- Pagination uses `nav` with an accessible name, current-page indication,
  previous/next, and a result-range summary. Infinite scroll is not used.

### Booking confirmation and upload

- Booking identification precedes file selection. The confirmation card groups
  patient/booking/service data under `Confirm booking` and must be reviewed
  again before publication.
- File selection supports keyboard and native file-picker use; drag-and-drop may
  enhance but never replace the labeled control.
- Filename is treated as untrusted display text and may be shortened visually
  without losing the full accessible value.
- Progress, safety processing, rejection, quarantine, and pending review are
  distinct. `Upload complete` is not used as a synonym for `available`.
- Inline validation is associated with the file field; a form error summary
  links to the first invalid control.

### Publication, correction, and withdrawal

- High-impact actions live in a clearly labeled `Report actions` region and are
  separated from `View`/`Download`.
- Publication uses a review page or modal with sufficient context and the
  explicit button `Make available to patient`.
- Correction uses `Upload correction`; content explains current-patient access
  before the new version is published.
- Withdrawal uses `Withdraw patient access`, requires a reason, and never uses a
  vague `Delete` label.
- Confirmations cannot be dismissed by accidental background click during
  commit. Escape closes only before submission and restores focus to the
  invoking control.
- Toasts may supplement but never replace inline/heading success or error state.

### Patient report access

- Results use a heading plus a semantic list; the primary action is always
  `View report`, not a card-wide click.
- Report context appears before PDF bytes load. Type/size and issuing clinic are
  stated in text.
- An embedded viewer, if chosen later, must not be the only access method;
  `Download PDF` and an alternative-format/support route remain available.
- No clinical severity badge, automated summary, interpretation, or “normal”/
  “abnormal” label is introduced.
- No offline or service-worker cache stores report pages or PDF bytes in the
  first release. Offline state explains that a secure connection is required.

## Low-fidelity design prototype

These text wireframes express hierarchy and interaction, not final styling.

### Clinic report queue — wide layout

```text
+--------------------------------------------------------------------------+
| healthAlst | Clinic workspace: Meridian Imaging — Ikeja | A. Staff ▾      |
+--------------------------------------------------------------------------+
| Reports (h1)                                    [Attach report to booking]|
| Manage reports for this clinic.                                           |
|                                                                          |
| Search reports [____________________] [Search]                            |
| Status [All ▾]  Service [All ▾]  Date [____–____]  [Clear all]            |
| Showing 1–50 of 500 · Sorted by latest update                            |
|                                                                          |
| Booking   Patient       Service       Date        Status            Action|
| BK-1042   Amina O.      Chest X-ray   12 Aug      Pending review    [View]|
| BK-1038   Chidi N.      MRI Brain     11 Aug      Available         [View]|
| BK-1029   Funke A.      CT Abdomen    10 Aug      Needs attention   [View]|
|                                                                          |
| [Previous]  Page 1 of 10  [Next]                                         |
+--------------------------------------------------------------------------+
```

### Upload and publication review

```text
+---------------------------------------------------------------+
| Attach report (h1)                                            |
| Step 1 of 2: Upload                                           |
|                                                               |
| Confirm booking                                               |
| Patient: Amina O.   Booking: BK-1042                          |
| Service: Chest X-ray   Service date: 12 Aug 2026              |
|                                                               |
| Report PDF                                                    |
| PDF only · Maximum 20 MiB                                     |
| [Choose file]  chest-xray-report.pdf                          |
| [Upload report]  [Cancel]                                     |
+---------------------------------------------------------------+

+---------------------------------------------------------------+
| Review publication (h1)                                      |
| This will make the report available in Amina O.'s account.    |
|                                                               |
| Booking: BK-1042  Service: Chest X-ray                       |
| File: chest-xray-report.pdf  Version: 1                      |
| Safety check: Passed   Status: Pending review                 |
|                                                               |
| [Make available to patient]  [Keep pending]                   |
+---------------------------------------------------------------+
```

### Patient imaging results — narrow layout

```text
+----------------------------------+
| healthAlst             Account ▾ |
|----------------------------------|
| Imaging results (h1)             |
| Reports made available by your   |
| imaging centers.                 |
|                                  |
| Chest X-ray                      |
| Meridian Imaging — Ikeja         |
| Service date: 12 Aug 2026        |
| Report date: 13 Aug 2026         |
| [View report]                    |
|----------------------------------|
| MRI Brain                        |
| Meridian Imaging — Ikeja         |
| Service date: 24 Jul 2026        |
| Report date: 25 Jul 2026         |
| [View report]                    |
|                                  |
| [Previous] Page 1 of 2 [Next]    |
+----------------------------------+
```

### Withdrawal confirmation

```text
+-----------------------------------------------------------+
| Withdraw patient access (dialog heading)                  |
| The patient will no longer be able to view or download    |
| this report. The report and audit history will remain.    |
|                                                           |
| Patient: Amina O.    Booking: BK-1042                     |
| Report: Chest X-ray, version 2                            |
|                                                           |
| Reason [Select reason ▾]                                  |
| Details (optional) [___________________________________]  |
|                                                           |
| [Keep available]  [Withdraw patient access]               |
+-----------------------------------------------------------+
```

## Loading, empty, error, permission, conflict, and recovery states

| Surface/event                          | Accessible state and content                                                                                                    | Safe action/recovery                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Initial protected page                 | Preserve the page heading; show a labeled loading status after meaningful delay; skeletons are hidden from assistive technology | On success replace as one region; on failure move focus to error heading |
| Report queue: no records               | `No reports are in this clinic queue.`                                                                                          | `Attach report to booking` when authorized                               |
| Report queue: no filter matches        | `No reports match these filters.` Active filters remain visible                                                                 | `Clear all filters`                                                      |
| Patient results: empty                 | `No imaging results are available in your account.`                                                                             | `Get help`; never mention pending or expected results                    |
| Booking source delayed/unavailable     | `Bookings cannot be loaded right now. No report has been attached.`                                                             | `Try again`; preserve safe search input; correlation reference           |
| Invalid/ineligible booking             | Explain the staff-actionable eligibility problem without offering an authorization bypass                                       | Return to scoped search or refresh authoritative state                   |
| File rejected before upload            | Field-linked type/size message and error summary                                                                                | Choose another approved PDF                                              |
| Safety check in progress               | `Checking file. The report is not available to the patient.`                                                                    | Leave safely and return from queue                                       |
| File quarantined/rejected              | `This file could not be accepted.` Do not expose scanner signatures publicly                                                    | Remove/replace file; approved staff support route                        |
| Upload interrupted                     | State whether bytes were committed; do not show pending report unless durable                                                   | Retry with idempotency; no duplicate version                             |
| Publish/correct/withdraw submitting    | Disable repeat submission; announce `Saving`                                                                                    | Wait; no optimistic terminal state                                       |
| Mutation success                       | Inline/heading confirmation with resulting lifecycle status and timestamp                                                       | Return to preserved queue/detail                                         |
| Mutation dependency failure            | State that the action did not complete when known; keep previous visible durable status                                         | Safe retry; support reference                                            |
| Stale/concurrent mutation              | `This report changed after you opened it.`                                                                                      | `Review latest report`; never auto-merge or auto-retry decision          |
| Unauthorized/wrong role                | `You do not have access to this area.` without protected object detail                                                          | Role-appropriate home and support                                        |
| Hidden/unknown patient report          | `This report is not available.`                                                                                                 | Results home and support; same content for hidden states                 |
| Session expiring                       | Warning dialog/status with remaining time and `Continue session` when policy permits                                            | Reauthenticate; preserve only safe return state                          |
| Session expired                        | Remove protected content from the active view and browser history/cache where technically possible                              | Sign in and reauthorize destination                                      |
| Rate limited                           | Explain temporary delay without account/report enumeration                                                                      | Time-bound retry guidance and support for repeated failure               |
| Offline                                | `A secure connection is required to access imaging reports.`                                                                    | Retry when online; no cached report content                              |
| Privacy request on hold/partial denial | Plain-language status, responsible controller, next step, and appeal/complaint route                                            | Provide requested evidence/identity or contact privacy team              |

## Status vocabulary

### Staff-facing

| System state                                | Staff label          | Supporting content                                              |
| ------------------------------------------- | -------------------- | --------------------------------------------------------------- |
| Upload/validation/scan active               | Checking file        | `The report is not available to the patient.`                   |
| Pending and ready for staff decision        | Pending review       | `Review the booking and report before making it available.`     |
| Current published version                   | Available to patient | Include publication time and authorized actor                   |
| Validation/scan/integration requires action | Needs attention      | Give safe, specific next step without leaking scanner internals |
| Intentionally removed from patient access   | Withdrawn            | Include withdrawal time; reason only to authorized roles        |
| Replaced by a corrected version             | Superseded           | Link authorized staff to the current version and history        |

### Patient-facing

Patients see only reports that are currently available. The list does not need
a status badge; availability is expressed by the presence of the report and the
`View report` action. Hidden lifecycle labels, reasons, versions, and counts are
not translated into patient copy.

## Accessibility and responsive behavior

### Structure and semantics

- Set the document language to approved first-release language and update it for
  any translated content. English is the initial content language; this is not a
  claim that English meets all target-user needs.
- Provide a visible-on-focus skip link to the main landmark.
- Use one `main`, role-appropriate `nav`, header, and one page `h1`; headings do
  not skip levels for styling.
- Use native links for navigation, buttons for actions, `table` for wide
  tabular data, lists/articles for mobile cards, `dialog` only for true modal
  confirmation, and native form controls by default.
- Associate help, requirements, errors, and units with controls. Required state
  is expressed in text/semantics, not asterisk or color alone.

### Keyboard and focus

- Reading/focus order follows visual and task order at every width.
- All actions are reachable by keyboard; drag/drop, hover, swipe, row click, and
  icon-only interaction are never the only mechanism.
- Focus indicators meet at least 3:1 adjacent contrast and are not obscured by
  sticky content.
- Opening a modal moves focus to its heading or first meaningful control;
  Tab/Shift+Tab remain within; Escape cancels only while cancellation is safe;
  close/cancel restores focus to the invoking action.
- Validation failure moves focus to an error summary whose links move to invalid
  fields. Mutation success moves focus to a confirmation heading. Conflict moves
  focus to the conflict heading and `Review latest report` follows in order.
- Pagination/filter updates move focus to a result summary or updated `h1`
  context without forcing the user to restart at the document top.

### Dynamic announcements

- Use polite status announcements for loading, filter results, upload progress,
  safety processing, and ordinary save success.
- Use assertive alert behavior only for terminal errors, expired access, or
  consequences requiring immediate attention.
- Do not repeatedly announce every upload percentage; announce meaningful
  milestones and expose current progress value semantically.
- Toasts are not the sole announcement or only recovery path.

### Contrast, motion, touch, zoom, and reflow

- Normal text meets 4.5:1 contrast; large text and meaningful UI graphics meet
  3:1; status never relies on color alone. Existing color tokens require measured
  verification before reuse for report states.
- Body text defaults to at least 1rem with comfortable line height; prose stays
  near 65–75 characters per line.
- Interactive targets aim for at least 44 by 44 CSS pixels and must meet the
  approved WCAG 2.2 target-size exception rules where smaller.
- At 200% zoom and 320 CSS pixels wide, no task loses content/action and the page
  does not require two-dimensional scrolling. PDF content may scroll internally
  only when the viewer makes that boundary and alternative access explicit.
- Animations are nonessential, short, and disabled/reduced for
  `prefers-reduced-motion`; no flashing or motion communicates status alone.
- Do not lock orientation. Support portrait and landscape where the browser and
  device allow it.

### Responsive layout

- **Narrow/zoomed:** one content column; list cards; filters in an accessible
  non-modal disclosure or modal sheet with focus containment; primary and safe
  secondary actions stack; destructive action remains visually separated.
- **Medium:** one main column plus optional contextual summary; cards or compact
  table chosen by available space rather than device name.
- **Wide:** table/list plus contextual action region; maximum content width
  prevents distant labels/actions; detail pages may use a two-column layout only
  when reading/focus order remains logical.
- Content priority on narrow screens is service, clinic/patient context as
  permitted, date, lifecycle status for staff, and primary action. Secondary
  audit metadata moves into labeled detail, never disappears.

### PDF accessibility finding

The application journey can meet WCAG requirements while an uploaded clinical
PDF remains inaccessible. The first-release PDF-only decision therefore needs a
content-governance treatment before an accessibility conformance claim:

- require issuing clinics to provide tagged, accessible PDFs under an approved
  policy, or provide an approved accessible alternative from the authoritative
  clinical source;
- expose file type/size, download, and a safe alternative-format support route;
- do not claim that the browser viewer remediates an inaccessible source PDF;
  and
- include PDF/alternative-format tasks in usability and assistive-technology
  validation.

This is finding `UXF-003` below and remains unresolved.

## Design-system and component boundaries

### Observed foundation

- Shared UI currently provides `StatusBadge` and color tokens for background,
  surface, text, muted text, border, accent, and warning.
- The current application page proves layout and server rendering but does not
  provide report, navigation, form, table, dialog, file-upload, or error-state
  patterns.
- Existing tokens/components are candidates for reuse, not accessibility or
  report-domain approval. Contrast, focus, semantics, states, and density must be
  verified before adoption.

### Shared primitives to design

- Button, Link, IconButton with text alternative, FormField, Input, Select,
  Checkbox/Radio, FileInput, ErrorSummary, InlineError, Alert/Status, Dialog,
  Disclosure, Pagination, Breadcrumb, Tabs only where the information model
  requires them, Skeleton/Progress, EmptyState, and SupportReference.
- `StatusBadge` may be extended for staff lifecycle labels after contrast and
  non-color verification.
- Shared primitives own semantics, focus, disabled/busy/error behavior, touch
  targets, contrast, and reduced-motion behavior.

### Role-specific composites

- Clinic-only: ReportQueueTable, ReportQueueCard, BookingConfirmation,
  ReportUploadPanel, PublicationReview, CorrectionLineage,
  WithdrawalConfirmation, ReportLifecycleHistory, TeamAccessList.
- Patient-only: PatientResultCard, PatientReportContext,
  SecureReportAccessPanel, PatientUnavailableState.
- Privacy-only: PrivacyRequestQueue, RequestDecisionPanel, HoldSummary,
  DualApprovalPanel.

Patient composites may reuse safe visual primitives and sanitized report-summary
types, but never import administrator mutation controls, mutation hooks, staff
history, hidden status counts, or clinic-wide data contracts.

## Expert review and prototype evidence

### Evidence classification

- **Artifact:** low-fidelity text prototype and state specification in this file.
- **Review method:** requirements traceability, cognitive walkthrough, error-path
  review, and accessibility checklist review performed on 2026-08-13.
- **Reviewer type:** model-assisted expert analysis; not a representative user,
  clinic employee, patient, disabled participant, clinical approver, or legal
  approver.
- **Not performed:** interactive prototype test, Figma inspection, browser test,
  screen-reader test, automated accessibility scan, or real-user usability test.

### Expert walkthrough results

| Task                                        | Walkthrough result                                                                             | Evidence limitation                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Staff finds correct booking and uploads PDF | Complete flow, verification context, validation, durable processing, and return path specified | Actual booking terminology, disambiguators, and staff mental model unvalidated   |
| Staff publishes pending report              | Consequence, review context, idempotent busy state, confirmation, and return specified         | Clinical release policy and confirmation comprehension require clinic validation |
| Staff corrects current report               | Immutable version explanation, pending correction, conflict, and supersession specified        | Clinic correction/addendum terminology unvalidated                               |
| Staff withdraws patient access              | Reason, explicit consequence, safe cancel, commit, failure, and audit specified                | Withdrawal policy and urgent clinical/support consequences unvalidated           |
| Patient finds and opens report              | Entry, available-only list, context, step-up, viewer/download, support, and return specified   | Patient comprehension, anxiety, mobile use, and identity recovery unvalidated    |
| Patient has no/hidden report                | Neutral empty/unavailable states avoid pending/existence disclosure                            | Wording requires representative comprehension testing                            |
| Keyboard and screen-reader-oriented flow    | Semantics, order, focus, announcements, modal, errors, and reflow specified                    | No runtime implementation or assistive-technology evidence exists                |

### Findings and treatment

| ID      | Impact   | Finding                                                                                                       | Treatment/status                                                                                                                                                    |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UXF-001 | Critical | Staff could publish against the wrong booking if patient/report context is not repeated at the decision point | Addressed in design: booking context precedes upload and is repeated in publication/correction confirmation; must be usability tested                               |
| UXF-002 | Critical | Patient empty/count/status content could reveal a pending or hidden report                                    | Addressed in design: patient queries/states show available records only and use neutral empty/unavailable copy; must be security and comprehension tested           |
| UXF-003 | High     | A clinically valid PDF may be inaccessible even when the surrounding application is accessible                | Open: clinic PDF-accessibility policy or authoritative accessible alternative plus assistive-technology validation required before conformance claim                |
| UXF-004 | High     | Patient identity linking, recovery, and step-up could block legitimate access or enable takeover              | Open: identity provider/policy interaction prototype and representative recovery testing required before implementation-ready sign-off                              |
| UXF-005 | High     | Dense desktop tables would fail mobile/zoomed users                                                           | Addressed in design: semantic table becomes a purpose-built list/card representation with identical task content; requires responsive prototype test                |
| UXF-006 | High     | Duplicate or stale publish/correct/withdraw actions could show false success                                  | Addressed in design: busy state, durable confirmation only, conflict review, no automatic decision retry; requires integration and usability testing                |
| UXF-007 | Medium   | Staff lists expose more patient information than necessary on shared screens                                  | Partially addressed: minimum task fields and no report narrative/contact data; clinic validation is needed for the second disambiguator and screen-privacy practice |
| UXF-008 | Medium   | Status vocabulary may be confused with clinical report status                                                 | Addressed in design: operational phrases (`Checking file`, `Pending review`, `Available to patient`) and no clinical interpretation; requires terminology test      |

## Usability and accessibility validation plan

### Participants and safeguards

- Recruit separate rounds for 5–8 imaging-center staff who perform or supervise
  report handoff and 5–8 adult patients who have accessed or waited for imaging
  results. Treat sample findings as qualitative, not market prevalence.
- Include representative mobile/low-bandwidth users and participants with
  relevant access needs; include keyboard and screen-reader users rather than
  simulating all disability experience.
- Obtain research consent, recording decision, compensation, withdrawal,
  privacy, safeguarding, retention, and deletion arrangements before sessions.
- Use approved non-production scenarios and PDFs; do not collect or display real
  participant reports, bookings, identifiers, credentials, or health history.

### Prototype tasks

#### Staff

1. Find the correct completed booking among similar patient names.
2. Upload a valid report, interpret safety processing, and leave/return.
3. Review and publish the correct pending report.
4. Correct an available report while explaining what the patient can see.
5. Resolve a stale conflict without overwriting another change.
6. Withdraw access and explain what remains in history.
7. Recover from invalid file, scan delay, booking outage, and session expiry.

#### Patient

1. Sign in/step up and find a newly available imaging report.
2. Identify issuing clinic/service/date and open/download the report.
3. Explain what `No imaging results are available in your account` means without
   inferring pending/clinical status.
4. Recover from unavailable report, session expiry, interrupted access, and
   identity-linking problem.
5. Find clinical-meaning support, alternative-format support, privacy request,
   and security help without sharing the report or credentials.

### Measures and gate criteria

- Zero wrong-patient, wrong-booking, unintended-publication, or hidden-report
  disclosure behavior during safety-critical tasks.
- At least 4 of 5 participants per primary role complete each core task without
  moderator correction in a round; failures are analyzed qualitatively rather
  than presented as population statistics.
- Median single-ease question score of at least 5/7 for each core task, with no
  unresolved pattern of confusion about pending, available, correction,
  withdrawal, or report meaning.
- No participant is blocked by keyboard, screen reader, zoom/reflow, touch,
  contrast, language, PDF access, or recovery behavior without an accepted and
  retested treatment.
- All critical/high usability or accessibility findings are fixed and retested,
  or explicitly accepted by the accountable UX/product approver with scope and
  consequence.

## Design decisions and requirement traceability

| Design decision                                                            | Requirements                                    | Verification carried forward                                                  |
| -------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| XD-001 separate role shells and persistent scope                           | FR-001–FR-003, AUTH-001–AUTH-004                | Identity/role prototype, access-matrix, browser orientation tests             |
| XD-002 repeated booking context and no bulk publish                        | FR-004, FR-006–FR-007, OUT-001                  | Staff usability tasks, error-prevention review, end-to-end test               |
| XD-003 staff-only pending and neutral patient states                       | FR-006–FR-009, AUTH-003, API-004                | Patient comprehension plus hidden-state security/browser tests                |
| XD-004 immutable correction and explicit withdrawal confirmations          | FR-010–FR-012, DEC-005                          | Staff usability, concurrency, audit, revocation tests                         |
| XD-005 progressive disclosure and no list-content fetch                    | FR-005, FR-008–FR-009, PERF-003, PRIV-002       | Network, cache, content-inventory, and browser tests                          |
| XD-006 non-interpretive content and clinical support route                 | A11Y-004, SUP-001                               | Content review with clinic/patients and browser tests                         |
| XD-007 complete state matrix and durable success only                      | FR-014–FR-015, API-002–API-004, REL-003–REL-004 | Component, failure-injection, conflict, retry, and browser tests              |
| XD-008 accessibility behavior and responsive table/card pattern            | A11Y-001–A11Y-004, COMPAT-001                   | Automated, keyboard, screen-reader, zoom/reflow, touch, browser/user evidence |
| XD-009 protected production experience with non-production design evidence | DATA-004, GOV-001–GOV-002                       | Environment/data review and research safeguards                               |

## Readiness conclusion and blockers

The information architecture, screen inventory, primary/secondary journeys,
state model, responsive behavior, content hierarchy, component boundaries,
accessibility behavior, low-fidelity prototype, and validation plan are defined.
They are ready for an interactive prototype and accountable review.

The experience-design gate is not ready to pass because:

1. no representative staff/patient usability evidence exists;
2. no interactive responsive prototype has been exercised with keyboard,
   assistive technology, or target browsers;
3. `UXF-003` (source PDF accessibility) and `UXF-004` (patient identity and
   recovery experience) remain open; and
4. clinic terminology, the booking disambiguator, correction/withdrawal policy
   comprehension, and support content remain unvalidated.

Next, create an interactive prototype from this specification, validate the
defined tasks with representative users and accessibility evidence, update the
findings/treatments, and only then mark this artifact `complete` for
UX/product-owner approval.
