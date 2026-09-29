# zoom-clone — Video Conferencing Platform (Zoom Clone)

> **Status: in progress — 2 of 27 tickets done (T-001, T-002).** Specs grill-locked, tickets published (`docs/tickets/`).
> The backend skeleton runs today (`GET /api/health` → `{"status":"ok"}`) with models + auto-seed on empty DB; no endpoints or frontend yet.
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

Status per feature — the plan is the 4 core flows; only the backend foundation exists so far.

| Feature | Status |
|---|---|
| Dashboard (clock, New / Join / Schedule tiles, Upcoming + Recent tabs) | planned (T-011…T-013) |
| Instant Meeting (live room, 10-digit Meeting ID, Invite Link) | planned (T-003, T-014) |
| Join Meeting (by ID or link + Display Name, not-found/ended errors) | planned (T-005, T-015) |
| Schedule Meeting (topic, description, date/time, duration → Upcoming) | planned (T-004, T-016) |
| Meeting Room (initials tiles, roster polling, self-mute, invite, leave) | planned (T-017…T-019) |
| Host mute-all / remove participant (bonus) | planned (T-007, T-020) |
| Responsive mobile/tablet/desktop (bonus) | planned (T-022) |

**[done] T-001 — backend scaffold:** env-driven settings, SQLAlchemy engine/session with `PRAGMA foreign_keys=ON`, CORS from `CORS_ORIGINS`, `GET /api/health`.

**[done] T-002 — models + seed:** `users` / `meetings` / `participants` with CHECK constraints (type/status/duration), unique indexed meeting code, cascade delete to participants; startup `create_all` + seed (Demo User, 3 upcoming + 4 ended meetings, dates relative to now) that runs only when the users table is empty.

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
│   │   ├── schemas/ routers/ services/ utils/   # T-003 onward
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

**[planned]** — contract fixed by spec 00, built in T-003…T-007:

`GET /me`, `POST /meetings/instant`, `POST /meetings`, `GET /meetings?filter=upcoming|recent`, `GET /meetings/{code}`, `POST /meetings/{code}/start`, `POST /meetings/{code}/join`, `POST /meetings/{code}/leave`, `GET /meetings/{code}/participants`, `PATCH /meetings/{code}/participants/me`, `POST /meetings/{code}/mute-all`, `DELETE /meetings/{code}/participants/{id}`.

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
| T-003…T-008 | Endpoints, host controls, backend tests | planned |
| T-009…T-027 | Frontend, flows, room, polish, deploy, README | planned |

## Deployment (TBD — T-024)

- Frontend URL: TBD · Backend URL: TBD · Repo URL: https://github.com/himanshukumar19/zoom-clone
