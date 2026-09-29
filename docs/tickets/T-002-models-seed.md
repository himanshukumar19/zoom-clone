# T-002: Models and schema with constraints; relative seed script

Priority: P0 — Depends on: T-001

Status: done

## Context

Spec 00 schema (evaluated). Needs Default User, Meeting, Participant with constraints and demo data so the dashboard has content on first boot.

## Scope

Three models with CHECK constraints (type/status/duration), unique indexed Meeting Code, cascade delete to Participants, startup create-all, seed (Demo User id=1, upcoming scheduled Meetings relative to now, ended Meetings with Participants) that runs only when the user table is empty.

## Out of scope

Endpoints, code generation util (T-003), frontend.

## Acceptance criteria

- [ ] Fresh boot creates tables and seeds: 1 Default User, upcoming Meetings dated relative to now, Recent populated
- [ ] Reboot with data does not duplicate seed rows
- [ ] Invalid type/status/duration rejected at the DB constraint level
- [ ] Deleting a Meeting cascades to its Participants

## Areas touched

Models, seed module, startup hook.

## Notes

All seed dates relative to now; store UTC. Seed user Demo User / demo@example.com (Q7).
