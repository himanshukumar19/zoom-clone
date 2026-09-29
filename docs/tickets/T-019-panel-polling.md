# T-019: Participants panel, 5s polling, removed-user ejection

Priority: P1 — Depends on: T-018

Status: ready-for-agent

## Context

Spec 05 part 3: live roster without sockets (ADR-0001: poll every 5s).

## Scope

Side panel (count, Host/Me labels, muted icons; sheet on mobile), polling hook, ejection of removed self to dashboard with toast.

## Out of scope

Host buttons (T-020).

## Acceptance criteria

- [ ] Joins/leaves/mutes appear within ~5s with no manual refresh
- [ ] Panel count and labels stay correct as membership changes
- [ ] Removed self is routed to dashboard with a plain toast, session cleared
- [ ] Polling stops on unmount/leave (no stray network loop)

## Areas touched

Participants panel, polling hook.

## Notes

Polling interval 5s is locked (D11) — no WebSocket shortcut in this ticket.
