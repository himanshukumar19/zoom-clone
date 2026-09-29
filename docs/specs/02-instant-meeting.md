# Spec 02 — Instant Meeting

Status: ready-for-agent

## Problem Statement

As the Default User, I want to start a Meeting right now with one click and share a link, so that I can meet immediately without scheduling.

## Solution

The New Meeting tile creates an instant Meeting (live, titled "{Default User}'s Meeting") with a Host Participant, persists the returned participant identity in session storage, and redirects straight into the Meeting Room where the Invite Link is available with a copy action (plus a small entry dialog showing the link).

## User Stories

1. As the Default User, I want one click on New Meeting to create and enter a live Meeting, so that there is zero friction.
2. As the Host, I want a unique Meeting Code generated for me, so that every instant Meeting is distinct.
3. As the Host, I want a shareable Invite Link derived from the Meeting Code, so that Guests can join (see spec 03).
4. As the Host, I want my Host Participant identity remembered for this Meeting session, so that room actions (mute, leave, host controls) attribute to me.
5. As the Host, I want to see the Invite Link on room entry with a copy button, so that sharing is immediate.
6. As the Default User, I want the new Meeting to appear in dashboard lists appropriately (live badge), so that I can re-find it.
7. As the Default User, I want a clear error if creation fails (backend unreachable), so that I know to retry after warmup.

## Implementation Decisions

- Creation is a single backend call that returns both the Meeting (with Code + computed Invite Link) and the Host Participant; the frontend stores the participant identity in session storage keyed by Meeting Code.
- Instant Meetings start in live status with no scheduled start/duration (spec 00 lifecycle).
- Title default uses the Default User's name; no title prompt before creation (speed over customization — rename is out of scope).
- Redirect uses framework-native router to the room route for the new Code.
- All backend calls client-side only; friendly error on failure (backend may be sleeping on first hit — warmup is an ops step, the UI just reports).

## Testing Decisions

- Test seams: the instant-create endpoint contract (API seam) + tile-click navigation behavior with mocked API.
- What makes a good test: one click → create called once → redirect to room route with new Code → participant identity stored; failure → visible error, no redirect.
- Prior art: API-level pattern from spec 00; component pattern from spec 01.

## Out of Scope

Pre-join settings, title editing, real media, scheduling options, recurring Meetings, Personal Meeting ID.

## Further Notes

- Invite Link must use the deployed frontend origin in production — verify on the deployed app, not just locally.
