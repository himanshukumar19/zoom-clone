# T-003: Meeting Code util + instant Meeting endpoint

Priority: P0 — Depends on: T-002

Status: ready-for-agent

## Context

Spec 02. The New Meeting tile needs a one-call create: live Meeting + Host Participant + computed Invite Link.

## Scope

Code generator (10 random digits, first non-zero, unique with retry), instant-create service + route returning Meeting (Code, display form, Invite Link) and Host Participant. Thin handler, logic in service.

## Out of scope

Schedule/list (T-004), join/start (T-005), frontend.

## Acceptance criteria

- [ ] POST creates a live instant Meeting titled "{Default User}'s Meeting" with a Host Participant
- [ ] Codes are 10 digits, first non-zero, unique across many rapid creates
- [ ] Response carries raw Code, spaced display Code, and computed (never stored) Invite Link
- [ ] No raw queries in the route handler

## Areas touched

Code util, meeting service, meetings router.

## Notes

Invite Link = `{FRONTEND_URL}/join/{code}`.
