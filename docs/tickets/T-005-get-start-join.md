# T-005: Get-by-code, host start, guest join

Priority: P0 — Depends on: T-003

Status: done

## Context

Spec 03. Join flow needs validation, Host start, and Guest join with lifecycle rules (ADR-0003).

## Scope

Get-by-code (200/404), host start (scheduled→live + Host Participant; 404/410), join with trimmed Display Name 1–50 (201; 404/410/422). First join to a scheduled Meeting flips it live. Removed-session rejoin blocked.

## Out of scope

Leave/participants (T-006), frontend.

## Acceptance criteria

- [ ] Unknown code → 404; ended Meeting → 410 on start and join
- [ ] Guest join with valid name returns Meeting + Participant; bad/empty name → 422
- [ ] First join to scheduled flips status to live
- [ ] Removed participant session cannot act again

## Areas touched

Meeting/participant services, meetings router.

## Notes

No waiting room by design (ADR-0003).
