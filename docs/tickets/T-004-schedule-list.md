# T-004: Schedule endpoint with validation; Upcoming/Recent list

Priority: P0 — Depends on: T-002

Status: done

## Context

Specs 04 + 01. Scheduling and the dashboard card both need these two endpoints.

## Scope

Schedule service + route (title ≤200, description ≤2000, start must be future, duration > 0 → 422 otherwise) and list route with `filter=upcoming|recent` (Upcoming: not ended and not past scheduled end; Recent: ended or past end; newest first).

## Out of scope

Join/start (T-005), frontend.

## Acceptance criteria

- [ ] Valid schedule returns 201 with Meeting + Invite Link; appears in Upcoming
- [ ] Empty title, past start, zero duration → 422 with detail envelope
- [ ] Upcoming/Recent filters match D13 definitions, newest first
- [ ] Past-scheduled-end unstarted Meeting counts as Recent, not Upcoming

## Areas touched

Meeting service, meetings router.

## Notes

Default duration 40 min is a frontend default (Q9); backend only enforces > 0.
