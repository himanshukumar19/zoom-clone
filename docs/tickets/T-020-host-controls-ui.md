# T-020: Host controls UI (Mute all, Remove)

Priority: P2 — Depends on: T-007, T-019

Status: ready-for-agent

## Context

Bonus (spec 05): visible host controls backed by T-007's 403-gated endpoints.

## Scope

Host-only Mute-all button and per-row Remove (never on Host/self); controls hidden for Guests; optimistic refresh via poll.

## Out of scope

Any moderation beyond mute-all/remove.

## Acceptance criteria

- [ ] Host sees and successfully uses both controls; roster reflects results within a poll cycle
- [ ] Guests never see the controls; forged calls still 403 (covered in T-008, spot-check here)
- [ ] Removed Participant's tile disappears; they get the ejection path from T-019

## Areas touched

Participants panel host actions.

## Notes

Cut before touching any P0/P1 if behind.
