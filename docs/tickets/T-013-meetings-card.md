# T-013: Meetings card with Upcoming/Recent tabs and row actions

Priority: P0 — Depends on: T-004, T-010, T-012

Status: ready-for-agent

## Context

Spec 01 core: the dashboard card that proves Upcoming + Recent work end to end.

## Scope

Tabs, rows (title, local date/time, duration, spaced Code), Live badge, Start (host) and Copy Invite Link per Upcoming row, Recent rows, illustrated empty states, refetch after create/schedule.

## Out of scope

New/join/schedule pages (T-014/15/16 own the flows; this ticket consumes their results).

## Acceptance criteria

- [ ] Upcoming/Recent tabs list backend-filtered Meetings newest-first with correct row fields
- [ ] Start enters the room as Host; Copy places the Invite Link on the clipboard
- [ ] Empty backends show the illustrated empty states, not blank cards
- [ ] Creating/scheduling then returning refreshes the lists

## Areas touched

Dashboard meetings card, row actions, data hook.

## Notes

The dashboard definition of done for P0.
