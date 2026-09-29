# T-014: New Meeting flow (create, store session, redirect, invite dialog)

Priority: P0 — Depends on: T-003, T-012

Status: ready-for-agent

## Context

Spec 02: one click from tile to live room.

## Scope

Tile click → instant endpoint → persist Host Participant identity → router redirect to room → entry dialog with copyable Invite Link (link also in room header).

## Out of scope

Join/schedule, room internals (T-017+).

## Acceptance criteria

- [ ] One click creates a live Meeting and lands in its room without extra steps
- [ ] Participant identity persisted per Code; reload keeps Host status
- [ ] Entry Invite Link copies correctly; failure shows a plain error, no redirect
- [ ] New Meeting surfaces on the dashboard with Live badge

## Areas touched

Tile wiring, instant flow, invite dialog.

## Notes

Verify the Invite Link uses the deployed origin in T-025.
