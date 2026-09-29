# zoom-clone — Video Conferencing Platform (Zoom Clone)

> **Status: in progress — 4 of 27 tickets done (T-001…T-004).** Specs grill-locked, tickets published (`docs/tickets/`).
> The backend serves health, instant-create, schedule, and upcoming/recent list endpoints (tested: `pytest tests/` green) with models + auto-seed on empty DB; join/start/room routes and all frontend still to come.
> Sections below are marked **[done]** or **[planned]** so you can tell what actually works. Deployed links TBD (T-024).

Functional Zoom web-app clone: create, join, and schedule meetings with a clean Zoom-like interface. Built as a Scaler SDE Fullstack assignment (1-day timeline).

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router + TypeScript + Tailwind CSS (SPA-style, all pages client-rendered), Lato, lucide-react |
| Backend | Python FastAPI + SQLAlchemy 2.x + Pydantic v2 |
| Database | SQLite (own schema, auto-seeded on empty DB) |
| Hosting | Vercel (frontend) + Render (backend) |

## Features

Status per feature — backend endpoints through T-004 exist; all frontend still to come.

| Feature | Status |
|---|---|
| Dashboard (clock, New / Join / Schedule tiles, Upcoming + Recent tabs) | planned (T-011…T-013) |
| Instant Meeting (live room, 10-digit Meeting ID, Invite Link) | backend **[done]** (T-003); flow UI planned (T-014) |
| Join Meeting (by ID or link + Display Name, not-found/ended errors) | planned (T-005, T-015) |
| Schedule Meeting (topic, description, date/time, duration → Upcoming) | backend **[done]** (T-004); page UI planned (T-016) |
| Meeting Room (initials tiles, roster polling, self-mute, invite, leave) | planned (T-017…T-019) |
| Host mute-all / remove participant (bonus) | planned (T-007, T-020) |
| Responsive mobile/tablet/desktop (bonus) | planned (T-022) |

**[done] T-001 — backend scaffold:** env-driven settings, SQLAlchemy engine/session with `PRAGMA foreign_keys=ON`, CORS from `CORS_ORIGINS`, `GET /api/health`.

**[done] T-002 — models + seed:** `users` / `meetings` / `participants` with CHECK constraints (type/status/duration), unique indexed meeting code, cascade delete to participants; startup `create_all` + seed (Demo User, 3 upcoming + 4 ended meetings, dates relative to now) that runs only when the users table is empty.

**[done] T-003 — instant meeting:** `POST /api/meetings/instant` creates a `live` meeting titled `"Demo User's Meeting"` plus a host participant; 10-digit code (first non-zero, unique with retry), spaced display form, Invite Link computed from `FRONTEND_URL` (never stored). Covered by `backend/tests/test_instant_meeting.py` (5 tests).

**[done] T-004 — schedule + list:** `POST /api/meetings` validates title ≤200 (trimmed, non-empty), description ≤2000, future `scheduled_start`, `duration_minutes` > 0 → 201 `{meeting}` or 422 with `detail`; `GET /api/meetings?filter=upcoming|recent` implements D13 (Upcoming = not ended and not past scheduled end; Recent = ended or past end; missed unstarted meetings count as Recent), newest-first by `created_at`.

## Repo layout

```
zoom-clone/
├── README.md
├── CONTEXT.md                  # domain glossary + locked decisions
├── AGENTS.md                   # repo rules for coding agents
├── docs/
│   ├── PROJECT_PLAN (1).md     # build spec (source of truth)
│   ├── adr/                    # 3 ADRs: tiles-only room, no-auth identity, early join
│   ├── specs/                  # 6 feature specs (00–05)
│   ├── tickets/                # T-001…T-027 implementation tickets
│   └── reference/              # Zoom UI screenshots (build reference)
├── backend/                    # FastAPI app  [exists]
│   ├── app/
│   │   ├── main.py             # app, CORS, startup hook
│   │   ├── config.py           # env settings
│   │   ├── database.py         # engine, session, FK pragma
│   │   ├── models/             # [done — T-002] user.py, meeting.py, participant.py
│   │   ├── schemas/ routers/ services/   # [done — T-003/T-004] instant, schedule, list
│   │   ├── utils/              # [done — T-003] meeting_code.py (generate/format/invite link)
│   │   └── seed.py             # [done — T-002] relative seed, runs when users empty
│   ├── requirements.txt
│   └── .env.example
└── frontend/                   # Next.js app  [not created yet — T-009]
```

## Setup

Backend **[done]** — verified on a clean Python 3.9+ venv:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set FRONTEND_URL, CORS_ORIGINS (no trailing slash)
uvicorn app.main:app --reload
curl http://localhost:8000/api/health   # {"status":"ok"}
```

Startup runs `create_all` then seeds demo data when the users table is empty (Demo User + 3 upcoming / 4 ended meetings with dates relative to now). Reboots with data do not re-seed.

Frontend **[planned]**:

```bash
cd frontend
npm install
cp .env.example .env   # set NEXT_PUBLIC_API_URL to the backend URL
npm run dev
```

## Environment variables

Backend (`.env.example`) **[done]**: `DATABASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS`.
Frontend (`.env.example`) **[planned]**: `NEXT_PUBLIC_API_URL`.
Never hardcode `localhost`; never commit `.env` or `.db` files.

## API

Base path `/api`, errors as `{ "detail": "..." }` (see `docs/specs/00-backend-foundation.md`).

**[done]**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check (Render warmup / QA) |
| POST | `/api/meetings/instant` | Create instant meeting + host participant → 201 `{meeting, participant}` (T-003) |
| POST | `/api/meetings` | Schedule meeting `{title, description?, scheduled_start, duration_minutes}` → 201 `{meeting}`, 422 on invalid/past input (T-004) |
| GET | `/api/meetings?filter=upcoming\|recent` | Dashboard lists per D13, newest first (T-004) |

**[planned]** — contract fixed by spec 00, built in T-005…T-007:

`GET /me`, `GET /meetings/{code}`, `POST /meetings/{code}/start`, `POST /meetings/{code}/join`, `POST /meetings/{code}/leave`, `GET /meetings/{code}/participants`, `PATCH /meetings/{code}/participants/me`, `POST /meetings/{code}/mute-all`, `DELETE /meetings/{code}/participants/{id}`.

Room actions take the caller's participant id via the `X-Participant-Id` header — see assumptions below.

## ER diagram

**[done — T-002]** `users` 1—N `meetings` (host); `meetings` 1—N `participants`; `users` 1—N `participants` (optional, host only). Active participant = `left_at IS NULL AND is_removed = false`.

```mermaid
erDiagram
    users ||--o{ meetings : hosts
    users ||--o{ participants : joins_as_host
    meetings ||--o{ participants : has

    users {
        int id PK
        text name
        text email UK
        datetime created_at
    }
    meetings {
        int id PK
        text meeting_code UK
        text title
        text description
        int host_id FK
        text type
        text status
        datetime scheduled_start
        int duration_minutes
        datetime started_at
        datetime ended_at
        datetime created_at
    }
    participants {
        int id PK
        int meeting_id FK
        int user_id FK
        text display_name
        text role
        boolean is_muted
        boolean is_removed
        datetime joined_at
        datetime left_at
    }
```

## Assumptions (locked in grill)

- **No auth**: one seeded Default User (id=1, Demo User) is always "logged in". No login/signup/passwords/tokens/routes.
- **No real audio/video**: room shows initials tiles; mute is a state flag; roster refreshes by 5s polling, no WebSockets.
- **Room identity is not security**: frontend `sessionStorage` participant id sent as `X-Participant-Id`, used only for host-only checks (403 otherwise). Anyone can forge it — it is a business-rule input, not a credential.
- Guests may join scheduled meetings before host Start (first join flips to live); join on ended → 410.
- SQLite on the host is ephemeral — seed re-runs on restart.
- Times stored in UTC, displayed in browser-local zone.
- Original work only: own text/SVG wordmark, no copied Zoom assets.

## Docs

- Build spec: `docs/PROJECT_PLAN (1).md`
- Glossary: `CONTEXT.md` · Decisions: `docs/adr/` · Specs: `docs/specs/` · Tickets: `docs/tickets/`
- Tracker mirror: `.scratch/` (all specs/tickets `ready-for-agent`)

## Progress

| Ticket | Scope | State |
|---|---|---|
| T-001 | Backend scaffold, config, DB session, CORS, health | done (`294d437`) |
| T-002 | Models + schema + seed | done (`1f20bfe`) |
| T-003 | Meeting code util + instant meeting endpoint | done (`2fc85a9`) |
| T-004 | Schedule endpoint + upcoming/recent list | done (`8fd997d`) |
| T-005…T-008 | Join/start, leave/participants, host controls, backend tests | planned |
| T-009…T-027 | Frontend, flows, room, polish, deploy, README | planned |

## Deployment (TBD — T-024)

- Frontend URL: TBD · Backend URL: TBD · Repo URL: https://github.com/himanshukumar19/zoom-clone
