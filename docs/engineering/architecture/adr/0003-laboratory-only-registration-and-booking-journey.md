---
status: accepted
date: 2026-08-14
decision_owners: [product-owner, architect]
---

# Laboratory-only registration with platform-provisioned patient and staff accounts

## Context

The cycle-3 RBAC model let patients, clinic owners, and staff self-register
through a role tab switcher, and let clinics add only staff who had already
self-registered. The product owner rejected this workflow: patients should
never create accounts, staff should be created by their laboratory with assigned
roles, and registration must be a single laboratory-only form. Patients book
publicly (no account), laboratories approve appointments, and the platform
issues one patient account per email so one account spans all laboratories.

## Decision

- Registration is laboratory-only: owner name, email, password, laboratory
  name, location, and address; it creates the organization and an `OWNER`
  membership atomically. Patient and staff self-registration endpoints and the
  role tab switcher are removed.
- A laboratory administrator creates staff accounts (display name, email, role
  in `ADMIN`/`REPORT_STAFF`); the platform generates the password and emails the
  credentials once. "Join by email after self-registration" is removed.
- The public booking journey (`GET /public/laboratories`,
  `POST /public/appointments`) provisions a patient account keyed by normalized
  email — reused across laboratories — with a platform-generated password stored
  only as a hash.
- The platform emails the portal link plus the one-time password with the
  report-availability notification while `last_login_at IS NULL`; the laboratory
  never handles patient credentials.
- Booking status becomes an explicit lifecycle (`REQUESTED`, `APPROVED`,
  `REJECTED`, `COMPLETED`) with a scheduled time set on approval; patient-visible
  results stay limited to `AVAILABLE` reports owned by the single account.
- The generic `organizations` persistence model, `organization_memberships`,
  and staff role enums are unchanged; "Laboratory" is the product vocabulary.

## Consequences

- Patients have exactly one account across all laboratories; credential
  delivery is centralized in the platform's provisioning path.
- No patient or staff self-registration surface exists, which removes the
  associated abuse surface but makes account recovery and password reset
  required paths (approved reset only; plaintext never logged).
- Public booking is an unauthenticated mutation, so input validation and
  bounded failure states matter; rate limiting is deferred as a known residual
  risk.
- Flyway gains a V6 migration for booking lifecycle columns and laboratory
  location; applied migrations remain immutable.

## Alternatives rejected

- Keeping patient/staff self-registration with role tabs: rejected by the
  product owner as a wrong workflow.
- Laboratory-chosen passwords for staff/patients: credentials must come from
  the platform so one patient account spans laboratories and labs never handle
  plaintext secrets.
- Per-laboratory patient accounts: fragments the patient's results across
  inboxes and contradicts the single-account requirement.

## Verification

Integration tests for laboratory registration, staff provisioning, public
booking (first and repeat), approval/rejection, one-time credential email,
cross-laboratory report aggregation on one account, and browser journeys for
the booking → approval → publication → patient sign-in path.
