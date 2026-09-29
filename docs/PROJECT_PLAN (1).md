# zoom-clone: End-to-End Project Plan (v2)

> **Audience:** the human developer and coding agents (opencode etc.).
> **Source of truth:** the Scaler AI Lab SDE Fullstack assignment PDF ("Video Conferencing Platform, Zoom Clone") plus the real Zoom screenshots in `docs/reference/`.
> **Scope rule:** build only what the assignment asks for. If the assignment does not mention something (real audio/video, camera, chat, screen share, reactions, passcodes, waiting rooms, recordings, personal meeting ID), it is **not** built. Do not add it "to be safe".
> **Deadline:** 1 day. Scope discipline beats ambition.

---

## 0. Workflow for the agent

Follow these phases in order.

| Phase | Skill / action | Output | Gate to next phase |
|---|---|---|---|
| 1 | **grill-me (with doc)** | Shared understanding; answers to Section 14 recorded in Section 3 | Human says "we are aligned" |
| 2 | **to-specs** | `docs/specs/*.md`, one per feature area | Human approves specs |
| 3 | **to-ticket(s)** | `docs/tickets/T-XXX-*.md` with acceptance criteria | Human approves ticket list and order |
| 4 | **Implement ticket by ticket** | One ticket = one commit series | Acceptance criteria pass |
| 5 | **Deploy, README, final QA** | Live URLs, README | Checklist in Section 13 is green |

Use whatever skill names the human gives you (`to-ticket` vs `to-tickets`). If a skill has its own output format, follow it, and keep this document as the source of truth for *what* to build.

### Rules during grill-me
- Read this whole document first. Ask **one question at a time**.
- Update **Section 3 (Locked Decisions)** after every answer. Nothing should live only in chat.
- No application code during grill-me. Time-box to 30-45 minutes; if the human has no opinion, accept the default and move on.
- Challenge anything in this plan that looks ambiguous or contradicts the assignment.

### Rules during implementation
1. One ticket at a time, in dependency order. Restate the acceptance criteria before coding and report pass/fail after.
2. Thin route handlers, logic in a service layer, no raw queries in routes.
3. No hardcoded URLs; use env vars. No secrets in git; provide `.env.example`.
4. The human must explain every line in the interview, so prefer **simple, readable code** over clever code. Add short comments where intent is not obvious.
5. Original work only. Do not copy from existing Zoom-clone repos (immediate disqualification).
6. If a requirement is ambiguous, stop and ask.
7. Commit per ticket: `T-012: implement schedule endpoint`.

---

## 1. Assignment requirements (what is actually asked)

**Goal:** a functional Zoom web app clone that replicates Zoom's design, UX and core meeting workflows: create meetings, join meetings, schedule meetings, manage participants, with a clean professional interface. The assignment says the look and feel should be **"exactly the same"** as the original.

### Mandatory stack
- Frontend: **Next.js** (Single Page Application)
- Backend: **Python, FastAPI or Django**
- Database: **SQLite**, own schema (**evaluated**)

### Core features (must have)
1. **Landing Dashboard.** Zoom-style homepage; navbar with profile/settings placeholders; buttons **New Meeting**, **Join Meeting**, **Schedule Meeting**; **Upcoming meetings** section; **Recent meetings** section.
2. **Instant Meeting.** Create instantly; generate a unique Meeting ID; generate a shareable invite link; redirect the user to the meeting room.
3. **Join Meeting.** Join with Meeting ID **or** invite link; enter a display name before joining; validate that the meeting exists.
4. **Schedule Meeting.** Title / Description; date and time picker; duration; auto-generated meeting link; stored in the database; shown in Upcoming.

### Good to have (bonus, only after core works)
- Responsive design (mobile, tablet, desktop)
- User authentication. **Not built.** The Important Notes say "No Login Required: assume a default user is logged in. Focus on the functionality rather than authentication." No login/signup pages, passwords, tokens, or protected routes.
- Host controls: **mute all** and **remove participant**

### Other explicit rules
- **Seed the database** with sample data.
- Design your own schema; it is evaluated.
- **README** with setup instructions, tech stack, assumptions.
- Public GitHub repo **and** a deployed app (Vercel, Netlify, Render, Railway, or similar). Submit both links.
- AI tools are allowed; be ready to explain every line.

### Evaluation criteria
Functionality, UI/UX (visual similarity), Database design, Code quality, Code modularity, Code understanding.

### "Important Notes" in the assignment, and where this plan handles each
| Note | Handled by |
|---|---|
| **UI Design:** totally resemble Zoom's design; study the UI first | Section 8 (built from real screenshots) and ticket T-021 (pixel pass) |
| **No Login Required:** default user is logged in; focus on functionality, not authentication | D3, Section 2 out-of-scope list. The navbar shows the default user's avatar and name from `GET /api/me`, nothing else |
| **Sample Data:** seed your database | Section 5 seed data, T-002 |
| **Database Design:** own schema, evaluated | Section 5, T-002 |
| **README:** setup instructions, tech stack, assumptions | Section 11, T-026 |
| **Original Work:** plagiarism means disqualification | Rule 5 in Section 0, own wordmark/SVGs (D17) |

---

## 2. Scope

### In scope
- The 4 core features, working on the **deployed** app.
- A meeting room page that the user is redirected to. Because the assignment asks for "manage participants" and "mute all / remove participant", the room shows the participants, who is host, and who is muted. **No real audio or video** (participants are shown as name tiles with initials).
- Seed script (runs automatically when the DB is empty).
- Responsive layout (bonus).
- Host controls: mute all, remove participant (bonus).

### Out of scope (do not build)
Real audio/video/WebRTC, camera or microphone access, screen share, chat, reactions, recordings, whiteboard, notes, summaries, passcodes, waiting rooms, recurring meetings, invitee emails, calendar integration, **authentication of any kind (login, signup, sign out, passwords, JWT, OAuth, protected routes)**, Personal Meeting ID.

State the "no real audio/video" assumption in the README.

### Priority order if time runs short
- **P0:** schema, backend core, dashboard, instant, join, schedule, deploy, README
- **P1:** meeting room with participants list, UI polish against the screenshots
- **P2:** responsive, host controls, `/meetings` list page

---

## 3. Locked Decisions (update during grill-me)

| # | Decision | Default |
|---|---|---|
| D1 | Backend | FastAPI, SQLAlchemy 2.x, Pydantic v2 |
| D2 | Frontend | Next.js App Router, TypeScript, Tailwind CSS (all pages client-rendered, SPA feel) |
| D3 | Auth | **None.** No login, signup, password, token or protected route. One seeded default user (id=1) is always "logged in" and is the host of everything they create. The frontend just calls `GET /api/me` for the name/avatar |
| D4 | Meeting ID | 10 random digits, first digit non-zero, unique. Stored raw (`1234567890`), displayed as `123 456 7890` |
| D5 | Invite link | `{FRONTEND_URL}/join/{meeting_code}`. Computed by the backend, not stored |
| D6 | Time | Stored in UTC; shown in the browser's local timezone |
| D7 | Instant meeting | Creates the meeting (status `live`) and the host participant, then redirects straight to the room |
| D8 | Guests joining | Anyone with a valid ID/link can join a meeting that is `scheduled` or `live`. Not `ended`. No waiting room |
| D9 | Starting a scheduled meeting | Host clicks **Start** on an upcoming meeting: status becomes `live`, host participant is created |
| D10 | Who am I in a meeting (not authentication) | After joining, the frontend remembers its `participant_id` in `sessionStorage` and sends it as `X-Participant-Id` on room actions (leave, mute self, mute all, remove). The backend only uses it to find the participant row and apply the business rule "only the host can mute all / remove". No users, sessions or tokens are involved. State this as an assumption in the README |
| D11 | Room updates | Poll the participants endpoint every 5 seconds. No WebSockets |
| D12 | Meeting end | When the last active participant leaves, the meeting becomes `ended` |
| D13 | Upcoming vs Recent | Upcoming: not ended and not past its scheduled end. Recent: ended, or a scheduled meeting whose time has passed. Newest first |
| D14 | Input limits | title <= 200, description <= 2000, display name 1-50 (trimmed) |
| D15 | Migrations | `create_all` + seed on startup |
| D16 | Deploy | Frontend on Vercel, backend on Render (or Railway) |
| D17 | Font / icons | Lato via `next/font`; `lucide-react` icons. Logo is a plain "zoom" wordmark in Zoom blue, made from text/SVG, not copied assets |
| D18 | SPA rule | All backend calls happen in the browser (`"use client"`). No fetching the backend at build time. Internal navigation uses `next/link` / `useRouter`, never full reloads |
| D19 | Reference UIs | Dashboard = **web client home** (`app.zoom.us/wc/home`). Single shared TopNav + IconRail everywhere (Q2 locked 2026-09-29 — overrides portal-bar variant for Join/Schedule). Meeting room has no reference screenshot, so keep it simple and dark |

---

## 4. Architecture

```
Browser (Next.js SPA on Vercel)
   | fetch (JSON, X-Participant-Id header)
   v
FastAPI (Render)  ->  SQLAlchemy  ->  SQLite file
```

### Repo structure
```
zoom-clone/
├── README.md
├── PROJECT_PLAN.md
├── docs/
│   ├── reference/        # real Zoom screenshots (see Section 8)
│   ├── specs/            # from to-specs
│   └── tickets/          # from to-ticket
├── backend/
│   ├── app/
│   │   ├── main.py            # app, CORS, startup (create_all + seed)
│   │   ├── config.py          # env settings
│   │   ├── database.py        # engine, session, PRAGMA foreign_keys=ON
│   │   ├── models/            # user.py, meeting.py, participant.py
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── routers/           # meetings.py, participants.py, me.py
│   │   ├── services/          # meeting_service.py, participant_service.py
│   │   ├── utils/             # meeting_code.py
│   │   └── seed.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── page.tsx                  # dashboard
    │   ├── join/page.tsx             # enter Meeting ID / link
    │   ├── join/[code]/page.tsx      # enter display name, join
    │   ├── schedule/page.tsx
    │   ├── meetings/page.tsx         # P2
    │   └── meeting/[code]/page.tsx   # room
    ├── components/
    │   ├── layout/    # TopNav, IconRail, PortalSidebar, Footer
    │   ├── dashboard/ # ClockCard, ActionTiles, MeetingsCard, MeetingRow, EmptyState
    │   ├── join/      # JoinForm, NameForm
    │   ├── schedule/  # ScheduleForm, DateTimeFields, DurationFields
    │   ├── room/      # MeetingRoom, RoomHeader, TileGrid, ParticipantTile, Toolbar, ParticipantsPanel, LeaveMenu
    │   └── ui/        # Button, Input, Select, Modal, Toast
    ├── lib/           # api.ts, session.ts, format.ts, parseMeetingInput.ts
    ├── hooks/         # useMeetings, useParticipants (polling)
    └── types/
```

---

## 5. Database schema (evaluated: keep it clean and normalized)

### `users`
| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| email | TEXT UNIQUE NOT NULL | no password column, since there is no login |
| created_at | DATETIME | UTC |

### `meetings`
| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| meeting_code | TEXT UNIQUE NOT NULL, indexed | 10 digits |
| title | TEXT NOT NULL | |
| description | TEXT NULL | |
| host_id | INTEGER FK users.id NOT NULL | |
| type | TEXT NOT NULL | `instant` or `scheduled` |
| status | TEXT NOT NULL | `scheduled`, `live`, `ended` |
| scheduled_start | DATETIME NULL | UTC. NULL for instant |
| duration_minutes | INTEGER NULL | NULL for instant |
| started_at | DATETIME NULL | |
| ended_at | DATETIME NULL | |
| created_at | DATETIME NOT NULL | |

Constraints: CHECK on `type` and `status`; CHECK `duration_minutes > 0`; index on `(host_id, status, scheduled_start)`.

### `participants`
| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| meeting_id | INTEGER FK meetings.id ON DELETE CASCADE | |
| user_id | INTEGER FK users.id NULL | set for the host, NULL for guests |
| display_name | TEXT NOT NULL | |
| role | TEXT NOT NULL | `host` or `participant` |
| is_muted | BOOLEAN default false | |
| is_removed | BOOLEAN default false | set by host "remove" |
| joined_at | DATETIME NOT NULL | |
| left_at | DATETIME NULL | NULL means currently in the meeting |

Relationships: `users 1-N meetings` (host), `meetings 1-N participants`, `users 1-N participants` (optional). "Active participant" = `left_at IS NULL AND is_removed = false`.

An ER diagram (Mermaid) goes in the README.

### Seed data (auto-runs when `users` is empty)
- 1 default user (name and email decided in grill-me).
- 3 upcoming scheduled meetings (relative to now: tomorrow, +3 days, +7 days) with titles and descriptions.
- 4 ended meetings from the past week with a few participants each, so Recent is populated.
- Dates are computed relative to "now", never hardcoded.

---

## 6. Backend API

Base path `/api`. JSON. Errors: `{ "detail": "..." }`.

| Method | Path | Purpose | Success | Errors |
|---|---|---|---|---|
| GET | `/me` | Default user (navbar/profile placeholder) | 200 | |
| POST | `/meetings/instant` | Create instant meeting + host participant | 201 `{meeting, participant}` | |
| POST | `/meetings` | Schedule meeting `{title, description?, scheduled_start, duration_minutes}` | 201 `{meeting}` | 422 invalid, past date |
| GET | `/meetings?filter=upcoming\|recent` | Lists for the dashboard | 200 | |
| GET | `/meetings/{code}` | Validate meeting exists (used by Join) | 200 | 404 |
| POST | `/meetings/{code}/start` | Host starts a scheduled meeting | 200 `{meeting, participant}` | 404, 410 ended |
| POST | `/meetings/{code}/join` | `{display_name}` join as participant | 201 `{meeting, participant}` | 404, 410 ended, 422 |
| POST | `/meetings/{code}/leave` | Leave (header identifies participant); auto-ends when last one leaves | 200 | 400 missing header, 404 |
| GET | `/meetings/{code}/participants` | Active participants | 200 | 404 |
| PATCH | `/meetings/{code}/participants/me` | `{is_muted}` toggle own mute | 200 | 400 missing header, 404 |
| POST | `/meetings/{code}/mute-all` | Host-only rule. Mute all non-host participants | 200 | 403 not the host |
| DELETE | `/meetings/{code}/participants/{id}` | Host-only rule. Remove participant (cannot remove host or self) | 200 | 403 not the host, 404 |

Meeting responses include: `id, meeting_code, meeting_code_display, title, description, type, status, scheduled_start, duration_minutes, invite_link, host: {name}`.

Rules: a removed participant cannot rejoin with the same session; `join` on an `ended` meeting returns 410; the first join to a `scheduled` meeting sets it `live`.

---

## 7. Feature behaviour (by assignment requirement)

### 7.1 Dashboard (`/`)
- Web client home layout (see Section 8.1): top bar with profile/settings placeholders, left icon rail, centered clock + date, three action tiles, then a card with **Upcoming** and **Recent** tabs (both are required by the assignment).
- Upcoming rows: title, date/time, duration, meeting ID, actions **Start** (host) and **Copy invite link**. Live meetings show a small "Live" badge.
- Recent rows: title, date, duration, meeting ID.
- Empty states use the illustrated Zoom-style empty state with text ("No meetings scheduled." / "No recent meetings.").
- Refetch after creating or scheduling a meeting.

### 7.2 New Meeting
Click the orange **New meeting** tile, backend creates the instant meeting (title `"{User}'s Meeting"`), save `participant_id`, redirect to `/meeting/{code}`. Invite link is available from the room header (copy button) and shown in a small dialog on entry.

### 7.3 Join Meeting
1. `/join`: single input "Meeting ID or invite link". The **Join** button is disabled (grey) until the field has text.
2. `parseMeetingInput` accepts `123 456 7890`, `1234567890`, or a full invite link (extract the code). Then call `GET /meetings/{code}` to validate. Not found shows an inline error: "Meeting ID not found. Check it and try again." Ended shows "This meeting has ended."
3. `/join/{code}`: display name field (required, trimmed, 1-50), **Join** button. Invite links open this page directly and validate on load.
4. On success, save `participant_id` and go to the room.

### 7.4 Schedule Meeting (`/schedule`)
Fields: Topic (required), Add Description (link that reveals a textarea), date picker, time picker + AM/PM, Duration (hr and min selects), read-only time zone label showing the browser's zone. Meeting ID is always "Generate Automatically". Buttons **Save** and **Cancel**. Validation: title required, start must be in the future, duration > 0. On save, show a success state with the meeting details and a **Copy invite link** button, and the meeting appears in Upcoming.

### 7.5 Meeting room (`/meeting/[code]`)
- Guard: no participant in `sessionStorage` for this code, so redirect to `/join/{code}`.
- Dark UI. Top bar: meeting title, meeting ID, **Invite/Info** button that opens the invite link with a copy button. Elapsed timer.
- Tile grid: one tile per active participant showing initials avatar, display name, host label, muted icon. Responsive grid (1 to N tiles).
- Bottom toolbar: **Mute/Unmute** (state only, updates `is_muted`), **Participants** (opens panel), **Invite**, red **Leave**.
- Participants panel: list with count, "(Host)" and "(Me)" labels, muted icons. For the host only: **Mute all** button and a **Remove** action per row.
- Leave: confirm popover; the host and guests see "Leave meeting". Then go to the dashboard.
- Poll participants every 5 seconds. If the current participant was removed, send them to the dashboard with a toast.

---

## 8. UI specification (from the real Zoom screenshots)

Screenshots are in `docs/reference/`. Colors below are **eyeballed approximations**; sample real values with a color picker during the polish ticket. Crop or blur the profile photo and personal meeting ID in the screenshots before committing them to the public repo.

| File | What it shows | Used for |
|---|---|---|
| `03-web-client-home.png` | `app.zoom.us/wc/home` | **Dashboard** |
| `04-join-meeting.png` | `zoom.us/join` | **Join page** |
| `05-schedule-meeting-top.png`, `06-schedule-meeting-bottom.png` | `zoom.us/meeting/schedule` | **Schedule page** |
| `07-meetings-upcoming.png` | `zoom.us/meeting#/upcoming` | `/meetings` page (P2), empty state |
| `01-portal-home.png`, `02-portal-footer.png` | `zoom.us/myhome`, footer | Portal nav, sidebar, footer styling reference only |

### 8.0 Design tokens (approximate)
| Token | Value | Use |
|---|---|---|
| `--zoom-blue` | `#0B5CFF` | Primary buttons, links, active states |
| `--zoom-blue-dark` | `#0A4FD9` | Hover |
| `--zoom-orange` | `#FF6A1A` | New meeting tile |
| `--text` | `#232333` | Headings, body |
| `--text-muted` | `#6E7085` | Secondary text, tile labels, date line |
| `--border` | `#DDE1E8` | Inputs, cards |
| `--bg-app` | `#EEF1F6` | Web client page background around the white panel |
| `--bg-sidebar` | `#F5F6FA` | Portal sidebar |
| `--bg-nav-dark` | `#0B1329` | Portal utility bar (optional) |
| `--info-bg` | `#EEF5FF` | Info callouts (blue border) |
| `--danger` | `#E02828` | Leave / Remove |
| Room bg / toolbar | `#1C1C1E` / `#232326` | Meeting room |

Font: Lato-like sans. Radius: 8px for inputs/buttons/cards, ~18px on the round-square action tiles.

### 8.1 Dashboard, web client home (`03-web-client-home.png`)
- **Top bar** (white, ~64px, bottom border): left = "zoom" wordmark + divider + "Workplace" text. Center = back/forward/history icons and a light-grey rounded search pill with placeholder "Search ⌘ + K". Right = bell icon and round avatar with a small green online dot. Build the bar with the default user's avatar (opens a small static menu placeholder, with **no** Sign in / Sign out items) and a settings entry; the extra items in the real bar (Discover Products, Pricing, Admin Center, Download, Upgrade) are not required, so keep at most the search pill as a static placeholder.
- **Left icon rail** (~78px, light grey-blue): stacked icon + 11px label items: **Home**, **Meetings**, **Chat**, **Contacts**, and **Settings** pinned to the bottom. These are static placeholder pages for visual similarity; only Home, Meetings, Schedule, Join, and Room have real functionality.
- **Main panel**: white rounded container on the `--bg-app` background, content centered in a column about 600px wide.
- **Clock block**: time in bold ~40px (`9:14 PM`), date below in muted ~16px (`Tuesday, September 29`). Updates every second/minute from the browser clock.
- **Action tiles** (three, horizontally centered, ~56px round-squares with a 14px muted label underneath, ~60px gaps):
  1. **New meeting**, orange tile with a white camera icon, small chevron after the label (dropdown is optional, one action is enough).
  2. **Join**, blue tile with a white "+" icon.
  3. **Schedule**, blue tile with a white calendar icon showing the day number.
- **Meetings card** (below the tiles, same column width, 1px border, 8px radius): header with title/date row, then tabs **Upcoming | Recent**. Empty state: light-blue umbrella illustration (simple inline SVG) with muted text "No meetings scheduled." Rows in the list are ~64px high with a time column, title, ID, and action buttons on the right.
- The real page has Recordings / Summaries / My Notes cards, an upgrade promo and a calendar-connect banner. **Do not build these.**

### 8.2 Join page (`04-join-meeting.png`)
- Minimal white page. Top bar: "zoom" wordmark left; right side links **Support, Schedule, Join, Host, Web App** and avatar. Keep it consistent with the dashboard top bar if the human prefers (decide in grill-me).
- Centered column ~360px wide, starting ~130px below the bar:
  - Title **Join Meeting**, bold ~24px, centered.
  - Label "Meeting ID or Invite Link" (14px), input ~44px high, placeholder "Enter Meeting ID or Invite Link", 8px radius. Focus state: 2px blue outline with a light outer ring.
  - **Join** button full input width, ~40px high. Disabled: light grey background with grey text. Enabled: `--zoom-blue` with white text.
- Footer: small centered "© 2026 Zoom Communications, Inc. ..." style line. Use your own copyright line such as "© 2026 zoom-clone (assignment project)".
- Name step (`/join/{code}`) reuses the same layout: title "Join Meeting", meeting title line, "Your Name" input, Join button.

### 8.3 Schedule page (`05` and `06`)
- Portal-style page: top bar as above, left sidebar (~300px, `--bg-sidebar`) with **Home** and **Meetings** (active: light-blue background, blue text), content area to the right with generous left padding.
- Top of content: blue link "‹ Back to Meetings" (goes to dashboard or `/meetings`), then title **Schedule Meeting** (bold ~22px).
- Two-column form rows: label column ~170px (14px dark text), control column starts right after. Rows in order:
  1. **Topic** (red asterisk before the label). Input ~490px wide, default value `My Meeting`, text pre-selected on focus, blue focus ring. Below it: "+ Add Description" blue link that reveals a textarea.
  2. **When**: date input (`MM/DD/YYYY` with a calendar icon at the right, ~240px), time select (`9:30`), AM/PM select.
  3. **Duration**: `hr` select, `min` select with text "hr" and "min" after each. Default 0 hr 40 min in Zoom; use the default decided in grill-me (Section 3 / Q12).
  4. **Time Zone**: full-width select in Zoom; we show the browser zone as read-only text.
  5. **Meeting ID**: radio "Generate Automatically" (selected, the only option).
- Selects and inputs: 1px `--border`, 8px radius, ~32-36px high, chevron on selects.
- Rows Zoom has that are **not** built: Template, Whiteboard, Docs, Security (passcode, waiting room), Encryption, My Notes, Meeting chat, Video on/off, Options, Recurring, Invitees, the 40-minute Basic-plan warning, the calendar warning.
- Buttons at the bottom: **Save** (blue, filled) and **Cancel** (white with border).

### 8.4 Meetings page (`07-meetings-upcoming.png`), P2
- Portal layout with sidebar. Heading **Meetings** (bold ~24px), blue **+ Schedule a Meeting** button top-right.
- Underlined tab row; build **Upcoming** and **Previous** only (active tab: blue text with a 2px blue underline). The other tabs in the screenshot (Attachments, Personal Room, Templates, Agendas) are not built.
- Empty state, centered: bold heading "Welcome to Zoom Meetings!" (~22px), one muted paragraph, and a blue **Schedule a Meeting** button. Write your own short paragraph, without plan-limit or upgrade text.

### 8.5 Meeting room (no reference screenshot; keep it simple)
- Full-viewport dark layout: top bar (title, meeting ID, invite button, timer), tile grid, bottom toolbar.
- Toolbar: dark bar, ~64px high, centered icon+label buttons (icon 22px above 11px label), muted-white color, hover lighter background; **Leave** is a red filled pill on the right. Icon-only labels collapse on small screens.
- Tiles: dark grey `#2A2A2E`, 8px radius, 8px gap, 16:9, centered large initials circle, name label bottom-left, muted mic-off icon when muted, "Host" tag.
- Participants panel: right-side drawer (full-screen sheet on mobile).

### 8.6 Responsive behavior (bonus)
- Build mobile-first with Tailwind from the first component.
- <768px: icon rail becomes a bottom bar or is hidden; action tiles stay in one row; meeting rows stack; room grid becomes 1-2 columns; participants panel becomes a bottom/full sheet; toolbar stays fixed at the bottom.
- Portal sidebar collapses behind a menu button.

---

## 9. Environment variables

`backend/.env.example`
```
DATABASE_URL=sqlite:///./zoom_clone.db
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```
`frontend/.env.example`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 10. Deployment

- **Backend (Render):** root `backend/`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `FRONTEND_URL` and `CORS_ORIGINS` to the Vercel domain (no trailing slash). SQLite on Render's free disk is ephemeral, so the seed re-runs on start; mention this in the README.
- **Frontend (Vercel):** root `frontend/`, set `NEXT_PUBLIC_API_URL` to the Render URL. Confirm invite links use the deployed domain.
- Warm the backend before submission and before the interview (free instances sleep).
- Submit: public GitHub repo link + deployed app link.

---

## 11. README (required by the assignment)

Overview and screenshots; **tech stack**; setup instructions that work from a clean clone (backend + frontend); env vars; ER diagram; API list; **assumptions** (default user, no auth, no real audio/video, `X-Participant-Id` is not real security, seed data, timezones, ephemeral DB on the host); deployed link and repo link.

---

## 12. Tickets (draft for to-ticket)

### Epic A: Backend
- **T-001 (P0)** Backend scaffold, config, DB session with `PRAGMA foreign_keys=ON`, CORS, health route.
- **T-002 (P0)** Models and schema (users, meetings, participants) with constraints; seed script relative to now. [T-001]
- **T-003 (P0)** Meeting code util + instant meeting endpoint (creates host participant). [T-002]
- **T-004 (P0)** Schedule endpoint with validation; list endpoint for upcoming/recent. [T-002]
- **T-005 (P0)** Get-by-code, start, join endpoints with 404/410 rules. [T-003]
- **T-006 (P1)** Leave (auto-end), participants list, own mute toggle, `X-Participant-Id` dependency. [T-005]
- **T-007 (P2)** Host controls: mute-all, remove participant (host-only, 403 otherwise). [T-006]
- **T-008 (P1)** Minimal backend tests: code uniqueness, join rules, list filters, host-only checks. [T-007]

### Epic B: Frontend foundation
- **T-009 (P0)** Next.js + Tailwind scaffold, tokens from Section 8.0, Lato font, base UI components. 
- **T-010 (P0)** `lib/api.ts`, `lib/session.ts`, `parseMeetingInput`, types. [T-009]

### Epic C: Dashboard
- **T-011 (P0)** Layout shell: top bar with profile/settings placeholders, icon rail. [T-009]
- **T-012 (P0)** Clock block + three action tiles (visuals only). [T-011]
- **T-013 (P0)** Meetings card with Upcoming/Recent tabs, rows, empty states, Copy link, Start. [T-004, T-010, T-012]

### Epic D: Core flows
- **T-014 (P0)** New Meeting: call instant endpoint, save session, redirect, invite dialog. [T-003, T-012]
- **T-015 (P0)** Join flow: `/join` (ID or link, validation) and `/join/[code]` (display name). [T-005, T-010]
- **T-016 (P0)** Schedule page/form with validation and success state. [T-004, T-010]

### Epic E: Meeting room
- **T-017 (P1)** Room page: guard, dark layout, header, timer, tile grid with initials tiles. [T-006, T-014]
- **T-018 (P1)** Toolbar: mute toggle, participants, invite, leave; leave flow. [T-017]
- **T-019 (P1)** Participants panel + 5s polling; removed-user handling. [T-018]
- **T-020 (P2)** Host controls UI: Mute all, Remove. [T-007, T-019]

### Epic F: Polish
- **T-021 (P1)** Pixel pass against screenshots: sample real colors, spacing, focus/hover/disabled states. [T-013, T-015, T-016]
- **T-022 (P2)** Responsive pass. [T-021]
- **T-023 (P2)** `/meetings` page with Upcoming/Previous tabs. [T-013]

### Epic G: Ship
- **T-024 (P0)** Deploy backend and frontend, env, CORS. [core done]
- **T-025 (P0)** Live QA on the deployed URL. [T-024]
- **T-026 (P0)** README. [T-025]
- **T-027 (P1)** Cleanup, lint/format, `.env` and `.db` audit, `docs/interview-notes.md` (schema, every endpoint, every component). [all]

**Cut line:** if behind at hour 13, drop T-023, then T-022 extras, then T-020. Never drop T-024 to T-026.

**Ticket template**
```
# T-XXX: <title>
Priority: P0/P1/P2   Depends on: T-...
## Context
## Scope
## Out of scope
## Acceptance criteria (checkbox list)
## Files to create/modify
## Notes
```

---

## 13. Definition of done

- [ ] New Meeting, Join (ID and link), Schedule, Upcoming and Recent all work on the **deployed** app
- [ ] Invite links use the deployed domain and work in a new tab
- [ ] Friendly errors: unknown ID, ended meeting, empty name, empty title, past date
- [ ] DB auto-seeded; dates relative to now
- [ ] UI matches the screenshots (colors, fonts, layout, empty states, hover/focus/disabled)
- [ ] Only assignment features built; nothing from the out-of-scope list
- [ ] Responsive on mobile, tablet, desktop
- [ ] Host controls work, or are documented as not implemented
- [ ] README complete; repo public; no `.env` or `.db` committed
- [ ] Render warmed up before submission and interview
- [ ] Human can explain the schema, every endpoint and every component

### Pitfalls
- SQLite: `PRAGMA foreign_keys=ON`, `check_same_thread=False`.
- Store UTC, serialize with `Z`; store the meeting ID as raw digits.
- No hardcoded `localhost`; watch CORS trailing slashes.
- Fetch from the backend only in the browser (a sleeping Render server must not break the Vercel build).
- Use `next/link`, not full page reloads.
- Trim and length-limit `display_name`; never `dangerouslySetInnerHTML`.
- Do not copy Zoom logos or assets; use your own wordmark and simple SVGs.
- Do not build extras before the 4 core flows work on the deployed site.

---

## 14. Grill-me questions (one at a time; accept defaults when unsure)

1. Dashboard reference: web client home (default) or the portal home?
2. Should Join and Schedule use the portal-style top bar, or the same top bar as the dashboard for consistency?
3. Can guests join a scheduled meeting the host has not started (default yes)?
4. Should the `/meetings` page exist (P2), or is the dashboard card enough?
5. Meeting room with initials tiles and no media: confirmed?
6. Host controls: build them (P2) or skip and document?
7. Default user name and email for the seed?
8. Meeting ID: 10 digits confirmed?
9. Default schedule duration: 40 min (as in the screenshot) or 60?
10. Schedule as a full page (as in Zoom) confirmed?
11. FastAPI + TypeScript + Tailwind confirmed? Any component library allowed, or fully custom?
12. Render or Railway for the backend? Local Node and Python versions?
13. Commit style: one commit per ticket?

After each answer, update Section 3. When nothing is open, move to **to-specs**.
