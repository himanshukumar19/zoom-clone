# T-025: Live QA on the deployed URLs

Priority: P0 — Depends on: T-024

Status: ready-for-agent

## Context

Definition of done (plan §13): the four flows must work on the deployed app, not just locally.

## Scope

End-to-end pass on public URLs: instant, join by ID and by link (second browser/session), schedule→Upcoming, Start/Copy, room two-tile/mute/leave/auto-end, friendly errors (unknown ID, ended, empty name/title, past date).

## Out of scope

Fixes (file them against the owning ticket and re-run this QA), README (T-026).

## Acceptance criteria

- [ ] New, Join (ID + link), Schedule, Upcoming, Recent all green on deployed URLs
- [ ] Invite Link opened in a fresh session joins as a second tile
- [ ] All five friendly-error cases show the specified messages
- [ ] Failures logged per-ticket with repro steps; this ticket closes only when all green

## Areas touched

Deployed app verification only (no code unless miraculously trivial).

## Notes

Warm Render first; cold-boot sleeps mimic failures.
