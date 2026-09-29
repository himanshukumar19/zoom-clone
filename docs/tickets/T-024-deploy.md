# T-024: Deploy backend and frontend with env + CORS

Priority: P0 — Depends on: T-013, T-014, T-015, T-016, T-019 (core flows complete)

Status: ready-for-agent

## Context

Plan §10. Core must live on public URLs: backend on Render, frontend on Vercel.

## Scope

Render service (root backend/, pip install, uvicorn on $PORT; FRONTEND_URL + CORS_ORIGINS = Vercel domain, no trailing slash), Vercel app (root frontend/, NEXT_PUBLIC_API_URL = Render URL), confirm seed runs on the ephemeral disk.

## Out of scope

QA (T-025), README links (T-026 fills them in).

## Acceptance criteria

- [ ] Public frontend + backend URLs respond; CORS allows app calls
- [ ] Fresh backend boot seeds the Default User and demo Meetings
- [ ] Invite Links use the deployed domain, not localhost

## Areas touched

Hosting config, env vars, build/start commands.

## Notes

T-023 was dropped (Q4) — numbering skips it deliberately. Warm the backend before any QA.
