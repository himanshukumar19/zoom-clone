# T-008: Minimal backend tests (code, join rules, filters, host checks)

Priority: P1 — Depends on: T-007

Status: done

## Context

Spec 00 testing seam: HTTP API boundary on an isolated database. Locks the lifecycle rules before frontend work spreads.

## Scope

API-level tests: code uniqueness/format, join/start 404/410 rules, Upcoming/Recent filters, host-only 403s, last-leave auto-end.

## Out of scope

Frontend tests, load/perf tests.

## Acceptance criteria

- [ ] Suite runs green on a clean checkout against an isolated DB
- [ ] Covers code format/uniqueness, scheduled→live flip, ended 410s, list filters, host 403s, auto-end
- [ ] Tests assert status codes/envelopes/state transitions only, not internals

## Areas touched

Test suite setup, API tests.

## Notes

Establishes the pattern every later backend change must follow.
