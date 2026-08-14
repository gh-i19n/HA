# Pending appointment request card

## Purpose

The pending appointment request card helps laboratory staff review the patient
context, choose a confirmed show-up time, and approve or reject the request
without mixing those decisions with unrelated report-queue actions.

## Key design decisions

- Patient and booking context stays in a dedicated summary area so the staff
  member can confirm who and what they are acting on before choosing an action.
- Date, time, approve/reject actions, and the optional patient message are
  grouped in a lightly separated confirmation panel. On smaller screens the
  panel stacks below the patient summary instead of compressing the controls.
- Date and time fields use visible labels and the shared UI date picker/input
  primitives. The optional message is a separate full-width field so it remains
  easy to review before submission.
- Approve and Reject both disable the row while a decision is in progress, but
  only the selected action shows a loading spinner. This makes the current
  operation clear while preventing duplicate submissions.
- The pending state is explicit through the `Awaiting decision` label and
  status indicator; the card does not imply that approval has succeeded until
  the server response completes.

## Traceability

- Requirement: [FR-022 — Laboratory appointment approval with emailed
  feedback](../sdlc/02-requirements.md#fr-022--laboratory-appointment-approval-with-emailed-feedback)
- Experience design: [Pending appointment request card](../sdlc/03-experience-design.md#pending-appointment-request-card)
- Implementation record: [Implementation Record](../sdlc/06-implementation.md)
- Verification report: [Verification Report](../sdlc/07-verification.md)

## Implementation reference

The experience is implemented in
[`booking-decisions-panel.tsx`](../../client/apps/image-rendering/src/modules/reports/components/booking-decisions-panel.tsx)
and coordinated by
[`pending-requests-workspace.tsx`](../../client/apps/image-rendering/src/modules/reports/components/pending-requests-workspace.tsx).
