# T-007: Host-only mute-all and remove participant

Priority: P2 — Depends on: T-006

Status: ready-for-agent

## Context

Bonus host controls (spec 05). Only the Host may mute all or remove; Guests get 403.

## Scope

Mute-all (mutes non-host active Participants) and remove-by-id (sets removed; cannot remove Host or self), both gated on caller being Host.

## Out of scope

Frontend buttons (T-020), wider moderation (no chat/reports).

## Acceptance criteria

- [ ] Host mute-all mutes every non-host active Participant, 200
- [ ] Guest calling either → 403 with detail envelope
- [ ] Remove of Host/self → rejected; removed Participant cannot act afterwards
- [ ] Unknown participant id → 404

## Areas touched

Participant service, participants router.

## Notes

Build only after core room works; cut first if behind (after T-023 already dropped).
