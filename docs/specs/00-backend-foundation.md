# Spec 00 — Backend foundation (config, schema, seed, API conventions)

Status: ready-for-agent

## Problem Statement

As the developer, I need a running backend skeleton with a clean evaluated schema, deterministic seed data, and consistent API conventions, so that every feature (dashboard, instant, join, schedule, room) can be built on a stable contract without rework.

## Solution

Stand up the backend with environment-driven config, three normalized tables (Default User host, Meetings, Participants), auto-seed on empty database, and a uniform JSON/error envelope under the API base path. All business rules live in a service layer; route handlers stay thin.

## User Stories

1. As a developer, I want config from env vars with an example file, so that local and deployed (Render/Vercel) environments differ without code changes.
2. As a developer, I want CORS restricted to the configured frontend origin, so that the deployed frontend can call the API and nothing else needs to change.
3. As an evaluator, I want a normalized schema (Default User 1–N Meetings as host; Meetings 1–N Participants; optional user link on host participants), so that relationships are clean and enforceable.
4. As an evaluator, I want CHECK constraints on Meeting type/status and positive duration, plus indexes on Meeting Code and host/status/start lookups, so that invalid states are impossible and dashboard lists are fast.
5. As a developer, I want foreign keys enforced and cascading delete of Participants when a Meeting is removed, so that no orphan rows survive.
6. As a demo user, I want the database auto-seeded when empty (one Default User — Demo User; upcoming scheduled Meetings relative to now; ended Meetings with Participants for Recent), so that a fresh deploy shows a populated dashboard.
7. As a developer, I want all datetimes stored in UTC and serialized with a UTC designator, so that browsers in any timezone display correctly.
8. As a frontend developer, I want every error as a uniform detail envelope (404 unknown code, 410 ended Meeting, 422 validation, 403 non-host), so that the UI can show friendly messages.
9. As a developer, I want a health endpoint, so that Render warmup and QA can verify liveness.
10. As an interviewee, I want thin route handlers delegating to a service layer with no raw queries in routes, so that I can explain every line and point to one place per rule.

## Implementation Decisions

- Three entities only: Default User record, Meeting, Participant. Participant links to Meeting (required) and to Default User (nullable — set for Host, null for Guests). Active Participant = not removed and not left.
- Meeting Code: 10 random digits, first digit non-zero, unique (retry on collision); stored raw, exposed also in spaced display form.
- Invite Link is computed from the configured frontend origin plus the Meeting Code; never persisted.
- Meeting lifecycle states: scheduled, live, ended. Instant creation starts live; first join to a scheduled Meeting flips it live (ADR-0003); last active Participant leaving flips it ended.
- Upcoming = not ended and not past scheduled end; Recent = ended or past scheduled end; newest first (CONTEXT.md D13).
- Validation limits: title ≤200, description ≤2000, Display Name trimmed 1–50, scheduled start must be future, duration > 0.
- Seed runs only when the user table is empty; all dates relative to now, never hardcoded.
- Room identity is not authentication: callers send a participant identifier header on room actions; the backend uses it solely to locate the Participant row and enforce Host-only rules (ADR-0002).
- Room freshness via client polling of the participants listing every 5s; no sockets (ADR-0001).

## Testing Decisions

- Test seams: the HTTP API boundary is the single highest seam — all tests go through request/response behavior, never internals.
- What makes a good test: assert status codes, envelopes, and state transitions (e.g. join flips scheduled→live; last leave flips →ended; removed Participant cannot act), not service function names.
- Modules to test: Meeting Code generation (uniqueness/format), join/start/leave rules, Upcoming/Recent filters, Host-only enforcement (403 for Guests).
- Prior art: none yet (greenfield); establish the pattern with API-level tests using an isolated database, then reuse for every later spec.

## Out of Scope

Real media/WebRTC, authentication of any kind, migrations framework (startup create-all is the decision), recurring Meetings, passcodes, waiting rooms, Personal Meeting ID, emails/calendar, chat/reactions/recordings/whiteboard, frontend work (covered in specs 01–05).

## Further Notes

- Ephemeral disk on the host means seed re-runs on restart — document in README, not a bug.
- No trailing slashes in configured origins; never hardcode localhost — always env.
- If a future decision contradicts ADR-0001/0002/0003, flag it explicitly instead of silently overriding.
