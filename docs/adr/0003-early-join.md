# ADR 0003 — Early join: scheduled → live on first join, no waiting room

Date: 2026-09-29 — Status: Accepted (Q3/D8 locked)

## Context

Assignment does not specify whether guests must wait for host Start. Plan D8/D9 proposed open join to keep flow simple.

## Decision

Anyone with valid ID/link may join `scheduled` or `live`. First join flips `scheduled` → `live`. Host Start button just creates host participant + flips to `live` if not already. No waiting room, no passcodes. Join on `ended` → 410.

## Alternatives considered

- Block until host Start ("waiting for host"): rejected — needs waiting UI + host-presence tracking, not requested, adds failure modes on 1-day timeline.

## Consequences

- "Start" is convenience for host, not a gate.
- Upcoming vs Recent (D13) must use scheduled-end + status, since meetings can go live early.
- Seed + list filters must handle live-before-start case.
