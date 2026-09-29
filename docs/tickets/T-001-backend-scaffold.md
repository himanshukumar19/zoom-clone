# T-001: Backend scaffold, config, DB session, CORS, health

Priority: P0 — Depends on: none (frontier)

Status: ready-for-agent

## Context

Greenfield backend (spec 00). Nothing exists yet; every later ticket needs a running app with env config and a DB session.

## Scope

App factory, env-driven settings, engine/session with foreign-keys enforcement, CORS for the configured frontend origin, uniform error envelope, health route, startup hook stub (create-all + seed land in T-002).

## Out of scope

Models, endpoints, seed data, tests.

## Acceptance criteria

- [ ] `GET /api/health` returns 200 on a fresh checkout with example env
- [ ] Missing/unknown routes return the uniform detail envelope
- [ ] CORS allows only the configured frontend origin; no hardcoded localhost
- [ ] Foreign-key enforcement verified on the SQLite session

## Areas touched

Config, database session, app entry, health route.

## Notes

Provide `.env.example` now; never commit real `.env` or `.db`.
