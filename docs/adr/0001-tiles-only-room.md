# ADR 0001 — Tiles-only meeting room (no WebRTC / media)

Date: 2026-09-29 — Status: Accepted (Q5 locked)

## Context

Assignment says "functional video conferencing" and "manage participants" + bonus "mute all / remove". Deadline is 1 day. Stack is Next.js SPA + FastAPI + SQLite. No media server, TURN/STUN, or recording infra specified.

## Decision

Room shows initials-tiles, `is_muted` state only, polling `GET /participants` every 5s. No camera/mic access, no WebRTC, no screen share/chat/reactions/recordings.

## Alternatives considered

- Real WebRTC mesh: rejected — signalling + NAT + permissions + testing cannot fit 1 day; risks core flows (create/join/schedule) breaking.
- Embed third-party video SDK: rejected — violates original-work rule, adds secrets/cost.

## Consequences

- Must state "no real audio/video" in README assumptions (assignment requires honesty).
- `is_muted` is a UI state flag only, not actual audio control.
- UI/UX grading rests on dashboard/join/schedule fidelity + room layout, not media.
