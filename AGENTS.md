# Repository Engineering Guide

## Product and architecture

- Read `README.md`, architecture documentation, ADRs, and package manifests before changing code.
- Preserve the repository's established boundaries and vocabulary. Record consequential changes as an ADR.
- Keep this file focused on durable repository facts. Put repeatable procedures in skills or scripts.

## Working agreement

- Inspect branch and worktree state before editing. Preserve unrelated changes.
- Run `ai-sdlc status` for a new product, major initiative, release, or consequential maintenance change. Work only within the active gate unless the user explicitly waives an earlier gate.
- Make the smallest coherent change that completes the requested outcome.
- Do not modify generated files, applied migrations, lockfiles, public contracts, deployment configuration, or secrets unless the task requires it.
- Enforce authorization on the server and validate data at trust boundaries.
- Add or update tests for behavior, failures, permissions, and regressions.
- Use repository-native commands; do not substitute a different package manager or build system.

## SDLC evidence

- Keep gate artifacts under `docs/sdlc/` and machine-readable state under `.ai/sdlc/state.json`.
- Set an artifact's frontmatter to `status: complete` only when its claims are supported by evidence, then pass it with `ai-sdlc pass` and an allowed approver role.
- Only the user may waive or reopen a gate, pass the release gate, or authorize production changes.
- Route maintenance through the earliest affected lifecycle gate; do not treat an existing application as exempt from requirements, design, verification, security, or release controls.

## Commands

Document exact supported commands here after inspecting the repository:

- Install:
- Frontend focused checks:
- Frontend completion checks:
- Backend focused checks:
- Backend completion checks:
- Run the application:
- Run end-to-end tests:

## Definition of done

- The requested behavior is implemented, including relevant failure and permission paths.
- Required tests, static analysis, and builds pass.
- User-facing changes are verified through the real journey when the application can run.
- Browser console and network failures are checked for frontend or integration work.
- The diff contains no unrelated changes and documentation is updated when needed.
- The final report distinguishes verified evidence, residual risk, and checks that could not run.
