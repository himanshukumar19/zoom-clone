# T-012: Clock block + three action tiles (visuals)

Priority: P0 — Depends on: T-011

Status: ready-for-agent

## Context

Dashboard hero (spec 01): live clock + New/Join/Schedule tiles. Visuals first; wiring lands in T-013/T-014.

## Scope

Browser-clock time + date block and three tiles (orange New with camera icon, blue Join with plus, blue Schedule with calendar) with labels.

## Out of scope

Click behavior, lists.

## Acceptance criteria

- [ ] Clock ticks from the browser clock (no backend)
- [ ] Three tiles match round-square size/spacing/label styling from tokens
- [ ] Tiles are keyboard-focusable buttons (actions wired later)

## Areas touched

Dashboard clock + action-tile components.

## Notes

Keep markup semantic so the pixel pass (T-021) only retunes values.
