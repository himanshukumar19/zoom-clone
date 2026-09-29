# T-015: Join flow (ID/link validation + Display Name step)

Priority: P0 — Depends on: T-005, T-010

Status: done

## Context

Spec 03: Guests enter by Code or Invite Link, then name, then room.

## Scope

`/join` single-field page (Join disabled until non-empty; parse + validate; inline not-found/ended errors) and `/join/[code]` name step (Meeting title, required trimmed 1–50 name, join → store identity → room). Invite Links deep-link to the name step with on-load validation.

## Out of scope

Room internals, waiting rooms/passcodes.

## Acceptance criteria

- [ ] All three input forms reach the name step; unknown → "Meeting ID not found…", ended → "This meeting has ended."
- [ ] Empty/whitespace name blocked inline; valid join routes to the room with stored identity
- [ ] Deep Invite Link validates on load with the same error states
- [ ] Joining an unstarted scheduled Meeting enters immediately (live flip)

## Areas touched

Join pages, name form, validation wiring.

## Notes

Display Names are text-only; no raw HTML rendering.
