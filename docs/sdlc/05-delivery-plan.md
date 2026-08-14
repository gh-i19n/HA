---
sdlc_gate: delivery-planning
status: complete
---

# Delivery Plan

## Release scope and vertical slices

1. Adapt Eventorch identity and tenancy: schema, entities, repositories,
   registration/login/refresh/logout/switch, membership authorization, seeded
   clinic/users, and integration tests.
2. Adapt the Eventorch shell and settings: shared user menu and clinic switcher,
   route-based staff/patient sidebars, registration screens, profile, clinic,
   team/roles, sessions, and notification settings.
3. Adapt durable notifications and SSE: notification persistence/API,
   transaction-bound report/membership events, tenant-recipient stream, bell,
   query invalidation, read-one/read-all, reconnect and fallback.
4. Adapt document infrastructure: staff/patient authorized preview, canonical
   structured report/version model, Chest X-ray and MRI Brain templates, PDFBox
   and POI renderers, PDF/DOCX export, upload compatibility, and seeded examples.
5. Integrate and polish complete staff/patient journeys, then measure the
   paginated 500-row report-list performance and verify responsive/accessibility
   states.

## Dependency order, owners, and hand-offs

The database and backend contract of each slice precedes its frontend adapter.
Backend owns tenant/role/object authorization; frontend claims only gate
presentation. Shared UI owns domain-neutral composition. Reports publish domain
events; notifications consume them without reports depending on SSE transport.
No slice writes SQL in an application service.

## Test strategy and acceptance evidence

- migration plus JPA repository tests for constraints and tenant predicates;
- service/API integration tests for registration, token rotation, invitations,
  role matrix, report lifecycle, preview/export and notifications;
- renderer tests that open generated PDF/DOCX and assert expected sections;
- frontend unit/component tests for reusable shell, forms, menus, viewer and
  notification behavior;
- browser journeys for clinic owner, report staff and patient, including live
  report publication appearing in the patient's inbox/results;
- browser console/network inspection, keyboard/reflow checks and before/after
  large-list timing evidence.

## Environments, data, migration, and rollout plan

Use Flyway migrations after V3 and preserve existing applied files. Local/test
seed data creates one clinic, owner, report staff, two patients, 500 bookings,
two structured template examples, and mixed pending/available reports. Existing
seeded accounts are migrated into the same global user/membership model used by
new registrations. No deployment or production mutation is authorized.

## Risks, mitigations, checkpoints, and stop conditions

- Stop on failing migration, cross-tenant access, invalid refresh reuse, report
  content in SSE/logs, or a renderer output that cannot be opened.
- Preserve user-owned dirty-worktree changes and keep edits to the requested
  client/server/package UI and supporting migration/test/docs only.
- Retain durable polling/refetch behavior when SSE is unavailable.
- Treat PDF/DOCX output as document rendering, not diagnostic assistance; the
  authorized professional owns clinical finalization.

## Definition of done

All requested workflows use persisted users and JPA-backed tenant-aware data;
Eventorch-derived reusable components compose the shell/settings/viewer; staff
and patient permissions are enforced server-side; notifications survive SSE
disconnects; both templates preview and export as valid PDF/DOCX; focused and
completion checks pass; and the real browser journeys have evidence.
