# ADR 0002 — No auth; default user + X-Participant-Id room identity

Date: 2026-09-29 — Status: Accepted (D3/D10 locked, PDF "No Login Required")

## Context

PDF Important Notes: "Assume a default user is logged in. Focus on functionality rather than authentication." Bonus lists "User authentication" but Notes override it. Room still needs host-only rules for mute-all/remove.

## Decision

No login/signup/password/JWT/OAuth/protected routes. One seeded user id=1 (`Demo User / demo@example.com`) is always host. Frontend stores `participant_id` in `sessionStorage`, sends `X-Participant-Id` on room actions. Backend uses it only to find participant row + enforce host-only (403 otherwise).

## Alternatives considered

- Full auth: rejected — explicitly out of scope per Notes + AGENTS.md; would consume P0 time.
- No host checks at all: rejected — then "manage participants" bonus is meaningless.

## Consequences

- README must state `X-Participant-Id` is NOT security (spoofable), only a demo identity hint.
- Navbar avatar/menu is static placeholder from `GET /api/me`.
