# T-022: Responsive pass (mobile, tablet, desktop)

Priority: P2 — Depends on: T-021

Status: ready-for-agent

## Context

Bonus responsive (specs 01/04/05 already build mobile-first; this ticket verifies and fixes).

## Scope

Breakpoints audit: rail→bottom/hidden, tiles in one row, stacked meeting rows, 1–2 col room grid, sheet panel, fixed toolbar, collapsed sidebar.

## Out of scope

New features, desktop pixel tweaks (T-021 owns those).

## Acceptance criteria

- [ ] No horizontal scroll at 360px on dashboard, join, schedule, room
- [ ] Room stays usable one-handed: toolbar reachable, panel a sheet, tiles legible
- [ ] Tablet widths show no orphaned sidebars or overlapping header items

## Areas touched

Responsive styles across shell, dashboard, schedule, room.

## Notes

Trim extras here first if the clock runs out (after already-dropped T-023).
