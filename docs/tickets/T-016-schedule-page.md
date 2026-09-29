# T-016: Schedule page with validation and success state

Priority: P0 — Depends on: T-004, T-010

Status: done

## Context

Spec 04: full Zoom-like schedule page on the shared shell.

## Scope

Topic (required, default "My Meeting", preselect on focus), Add-Description reveal, date/time/AM-PM, hr/min duration (default 0/40), read-only browser-zone label, Generate-Automatically only, Save/Cancel, inline errors, success view with details + Copy Invite Link.

## Out of scope

Recurring/invitees/security rows, edit/delete scheduled, `/meetings` page (dropped Q4).

## Acceptance criteria

- [ ] Empty title, past start, zero duration blocked inline; backend 422s surface the same way
- [ ] Valid save shows success view with copyable Invite Link; Meeting appears in Upcoming
- [ ] Cancel creates nothing and returns to dashboard
- [ ] Local picks persist as the correct UTC instant (spot-check two zones in QA)

## Areas touched

Schedule page, form fields, local-to-UTC conversion.

## Notes

Zoom-only rows stay out; do not sneak in edit/delete here.
