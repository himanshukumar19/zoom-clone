# AGENTS.md — zoom-clone

## Source of truth
- `docs/PROJECT_PLAN (1).md` is the build spec (stack, schema, API, UI tokens, tickets). Follow it; don't re-derive from scratch.
- Assignment PDF: `docs/Scaler_SDE_Fullstack_Assignment_-_Zoom_Clone.docx.pdf`. If plan and PDF conflict, ask.
- Open grill items live in plan §3 (Locked Decisions) and §14. Don't write app code until human says aligned.

## Scope discipline (strict)
- Build only the 4 core flows: dashboard (Upcoming + Recent), instant meeting, join by ID/link + display name, schedule. Plus meeting room as initials-tiles only.
- Do NOT build: real audio/video/WebRTC, camera/mic access, screen share, chat, reactions, recordings, whiteboard, passcodes, waiting rooms, recurring meetings, invitee emails/calendar, Personal Meeting ID.
- Do NOT build auth of any kind (login/signup/signout, passwords, JWT, OAuth, protected routes) — assignment says assume a default user is logged in. Navbar avatar comes from `GET /api/me` (seeded user id=1) and is a static placeholder menu.
- Bonus only after core works on deployed URLs: responsive, host mute-all/remove. Original work only — no copied Zoom-clone code, logos, or assets; own text/SVG wordmark.

## Planned architecture (repo is greenfield — create this)
- `backend/` FastAPI + SQLAlchemy 2.x + Pydantic v2, SQLite file. `frontend/` Next.js App Router + TypeScript + Tailwind (all pages `"use client"`, SPA feel). See plan §4 for file layout.
- Rules: thin routers (`routers/`), logic in `services/`, no raw queries in routes. Backend base path `/api`, errors `{ "detail": "..." }`. No secrets in git; provide `backend/.env.example` and `frontend/.env.example`.

## Key decisions agents get wrong
- Meeting code: 10 random digits, first non-zero, unique; store raw (`1234567890`), display spaced (`123 456 7890`). Invite link `{FRONTEND_URL}/join/{code}` — computed, never stored.
- Time: store UTC, serialize with `Z`, display in browser local zone. Seed dates relative to now, auto-run when `users` empty.
- Identity in room is NOT auth: frontend keeps `participant_id` in `sessionStorage`, sends `X-Participant-Id` on room actions; backend uses it only for host-only checks (mute-all/remove → 403 if not host). Document as non-security in README.
- Lifecycle: instant → `live`; host Start flips `scheduled` → `live`; last active participant leaves → `ended`; join on `ended` → 410. Upcoming = not-ended and not past scheduled end; Recent = ended or past scheduled end, newest first.
- Room updates: poll `GET /meetings/{code}/participants` every 5s. No WebSockets.
- SQLite: `PRAGMA foreign_keys=ON`, `check_same_thread=False`, `create_all` + seed on startup. Env: `DATABASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS` (no trailing slash); frontend `NEXT_PUBLIC_API_URL`. Never hardcode `localhost` — always env vars.
- Frontend must never fetch backend at build time (Render sleeps → breaks Vercel build). Internal nav via `next/link` / `useRouter` only.
- Validation: title ≤200, description ≤2000, display name trimmed 1–50; schedule start must be future, duration > 0.

## Workflow
- Implement ticket-by-ticket in plan §12 dependency order. One ticket = one commit (`T-012: ...`). Restate acceptance criteria before/after each ticket.
- Keep code simple/readable (human must explain every line in interview). Prefer Context7 MCP docs for Next.js/FastAPI API questions.
- Definition of done (plan §13): all 4 flows work on deployed app, invite links use deployed domain, `.env`/`.db` never committed, README complete (setup, stack, ER diagram, assumptions: no auth, no real media, ephemeral Render SQLite, `X-Participant-Id`).
- Deploy: backend Render — root `backend/`, `pip install -r requirements.txt`, `uvicorn app.main:app --host 0.0.0.0 --port $PORT`; frontend Vercel — root `frontend/`. Warm backend before QA/submit.

## Agent skills

### Issue tracker

Local markdown under `.scratch/` (no GitHub remote yet). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles recorded as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
