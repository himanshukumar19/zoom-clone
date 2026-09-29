# CONTEXT.md — zoom-clone (grill-with-docs, in progress)

> Source: `docs/PROJECT_PLAN (1).md` + `Scaler_SDE_Fullstack_Assignment_-_Zoom_Clone.docx.pdf`
> Status: grill complete 13/13 (2026-09-29) — specs in `docs/specs/`, mirrored to `.scratch/*/spec.md` as `ready-for-agent`.

## Glossary (canonical terms)

- **Default User** — Single seeded user (id=1). Always treated as logged in. Host of everything created from dashboard. NOT authentication.
- **Meeting** — Either `instant` or `scheduled`. Has `meeting_code`, `title`, `description`, `status` (`scheduled`|`live`|`ended`).
- **Meeting Code / Meeting ID** — 10 random digits, first non-zero, unique. Stored raw `1234567890`, displayed spaced `123 456 7890`. [LOCKED D4, D8 scope]
- **Invite Link** — Computed `{FRONTEND_URL}/join/{code}`, never stored. [D5]
- **Host** — `participants.role=host`. For dashboard-created meetings = Default User. Only host may mute-all / remove (403 otherwise). Enforced via `X-Participant-Id`, documented as non-security.
- **Guest / Participant** — Anyone joining via ID/link with a display name (1–50 trimmed). `user_id=NULL`.
- **Display Name** — Per-join name, trimmed 1–50 chars. [D14]
- **Upcoming** — Not-ended AND not past scheduled end. Newest first. [D13 — open to grill Q3/Q4]
- **Recent** — Ended OR scheduled time passed. Newest first. [D13]
- **Meeting Room** — `/meeting/[code]`. Initials-tiles only, no real audio/video. Polls participants every 5s. [D11, Q5 open]
- **Dashboard** — Web client home (`app.zoom.us/wc/home`): top bar + icon rail + clock + 3 action tiles + Upcoming/Recent card. [LOCKED Q1=D19]

## Locked so far

- Q1 (D19): Dashboard = web client home. Join/Schedule = portal look. — 2026-09-29
- Q2 (D19-amend): Single shared TopNav + IconRail everywhere (override portal-bar variant for Join/Schedule — consistency over pixel-duplication). — 2026-09-29
- Q3 (D8): Guests MAY join scheduled-before-start; first join flips scheduled->live. No waiting room. — 2026-09-29
- Q4: No dedicated /meetings page; dashboard Upcoming/Recent card is sufficient. Drop T-023. — 2026-09-29
- Q5: Meeting room = initials-tiles only, no WebRTC/camera/mic. Explicit README assumption. — 2026-09-29
- Q6: Build host controls (mute-all + remove, host-only 403) as P2 after core. — 2026-09-29
- Q7: Seed user = Demo User / demo@example.com (id=1). — 2026-09-29
- Q8 (D4): Meeting Code = 10 digits confirmed. — 2026-09-29
- Q9: Default schedule duration = 40 min. — 2026-09-29
- Q10: Schedule = full page (Topic/Description/When/Duration/TZ/ID/Save-Cancel). — 2026-09-29
- Q11 (D1/D2/D17): FastAPI + Next.js TS + Tailwind, fully custom UI + lucide-react + Lato, no component lib. — 2026-09-29
- Q12 (D16): Vercel + Render. Local versions: detect from env at scaffold (Node 20 / Python 3.11 defaults). — 2026-09-29
- Q13: One commit per ticket (`T-XXX: ...`). — 2026-09-29

## Edge cases probed

- Removed participant tries to rejoin with same session → blocked; new display name = new participant row.
- Join on `ended` → 410 + "This meeting has ended." Join on unknown code → 404 + "Meeting ID not found."
- Last active participant leaves → `ended`. Host Start on `ended` → 410.
- Past scheduled end with no activity → counts as Recent, not Upcoming.
