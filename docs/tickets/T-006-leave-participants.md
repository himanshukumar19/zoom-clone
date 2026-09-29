# T-006: Leave with auto-end, participants list, self mute, identity header

Priority: P1 — Depends on: T-005

Status: done

## Context

Spec 05 backend half. The room needs roster, exit, and self-mute, keyed by the non-auth participant header (ADR-0002).

## Scope

Participant-identity dependency (missing → 400/404 envelope), leave (sets left_at; last active leave flips Meeting to ended), active-participants list, self mute-toggle patch.

## Out of scope

Host mute-all/remove (T-007), frontend.

## Acceptance criteria

- [ ] Participants list returns only active (not left, not removed)
- [ ] Leave without identity header → 400; last active leave → Meeting ended
- [ ] Self mute-toggle flips only the caller's own flag
- [ ] Join on the ended Meeting now returns 410

## Areas touched

Participant service, participants router, identity dependency.

## Notes

Header is room identity, not security — README will say so (T-026).
