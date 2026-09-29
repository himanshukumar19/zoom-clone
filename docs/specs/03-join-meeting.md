# Spec 03 — Join Meeting (ID or link + Display Name)

Status: ready-for-agent

## Problem Statement

As a Guest, I want to join a Meeting using either a Meeting ID or an Invite Link plus my Display Name, so that I can participate without an account.

## Solution

Two steps: (1) a Join page with a single "Meeting ID or Invite Link" field (Join disabled until non-empty) that parses input and validates existence via the get-by-code endpoint; (2) a name step showing the Meeting title with a required Display Name field that joins and routes into the Meeting Room, persisting the Participant identity in session storage. Invite Links deep-link directly to the name step with validation on load.

## User Stories

1. As a Guest, I want to paste either `123 456 7890`, `1234567890`, or a full Invite Link, so that any share format works.
2. As a Guest, I want the Join button disabled until I type something, so that I get an affordance cue.
3. As a Guest, I want "Meeting ID not found. Check it and try again." for unknown codes, so that typos are actionable.
4. As a Guest, I want "This meeting has ended." for ended Meetings, so that I don't wait pointlessly.
5. As a Guest opening an Invite Link, I want to land directly on the name step with the Meeting validated, so that one click less is needed.
6. As a Guest, I want to enter a Display Name (required, trimmed, 1–50) before joining, so that others see who I am.
7. As a Guest, I want empty/whitespace names rejected inline, so that anonymous tiles never happen.
8. As a Guest, I want successful join to remember my Participant identity and take me to the room, so that I don't re-enter my name on refresh.
9. As a Guest joining a scheduled-but-unstarted Meeting, I want to enter immediately (Meeting goes live), so that I never hit a waiting room (ADR-0003).
10. As a removed Participant, I want a clear notice if I try to rejoin with the same session, so that removal is meaningful.

## Implementation Decisions

- Input parsing (spaced digits, raw digits, full link extraction) is a pure frontend helper, unit-tested in isolation; validation always goes through the get-by-code endpoint.
- Join is a single endpoint call with the trimmed Display Name; response carries the Meeting + Participant; participant identity persisted in session storage keyed by Code.
- Ended Meetings surface the 410 as the "has ended" message; unknown codes surface the 404 as "not found"; validation errors inline, never toasts for these two.
- Name-step route doubles as the Invite Link landing page; it validates on load and shows the same error states.
- Room guard (spec 05) redirects anyone without a stored Participant for that Code back to the name step.

## Testing Decisions

- Test seams: the parsing helper (pure unit seam) + get-by-code/join endpoint contracts (API seam) + page behavior with mocked API.
- What makes a good test: each input format parses to the same Code; unknown → not-found message; ended → ended message; empty name blocked; success → stored identity + room route.
- Prior art: API pattern (spec 00), component pattern (spec 01).

## Out of Scope

Waiting rooms, passcodes, pre-join device checks, account-based joining, rejoin-after-removal with same session, Personal Meeting ID.

## Further Notes

- Never render user input as HTML (no raw-HTML injection); Display Names are text only.
- Deep-link validation must handle malformed links with the same not-found message.
