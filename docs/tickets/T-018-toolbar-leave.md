# T-018: Toolbar (self mute, participants toggle, invite, leave)

Priority: P1 — Depends on: T-017

Status: done

## Context

Spec 05 part 2: the controls that make the room usable.

## Scope

Mute/Unmute self (persists flag), Participants toggle, Invite with copy, red Leave with confirm popover → clears session → dashboard.

## Out of scope

Panel contents/polling (T-019), host buttons (T-020).

## Acceptance criteria

- [ ] Self mute-toggle flips the caller's icon everywhere within a poll cycle
- [ ] Leave asks to confirm ("Leave meeting" for host and guests), then dashboards with session cleared
- [ ] Last participant leaving ends the Meeting (join afterwards → ended message)
- [ ] Toolbar stays fixed/usable at mobile widths

## Areas touched

Room toolbar, leave flow.

## Notes

Mute is state-only (ADR-0001) — label honestly in UI copy if labeled at all.
