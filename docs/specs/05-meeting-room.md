# Spec 05 — Meeting Room (tiles, toolbar, participants, host controls)

Status: ready-for-agent

## Problem Statement

As a meeting participant, I need a simple dark room where I can see who is here, mute myself, view the participant list, invite others, and leave — with the Host able to mute all or remove disruptors — so that the core "manage participants" workflow is real even without live audio/video.

## Solution

A dark room route guarded by stored Participant identity (else redirect to the name step): header (title, Meeting Code display, Invite/Info with copyable link, elapsed timer), initials-tile grid (avatar initials, name, Host tag, muted icon), bottom toolbar (Mute/Unmute self, Participants toggle, Invite, red Leave with confirm), side participants panel (count, Host/Me labels, muted icons; Host-only Mute-all + per-row Remove), 5s polling refresh, removed-user ejection to dashboard with toast, and auto-end when the last active Participant leaves.

## User Stories

1. As a Participant, I want entry without stored identity to bounce to the name step, so that anonymous room access never happens.
2. As a Participant, I want to see every active Participant as an initials tile with name (+Host tag, muted icon), so that I know who is here.
3. As a Participant, I want a header with title, Meeting Code, invite button, and elapsed timer, so that context and sharing are always at hand.
4. As a Participant, I want Mute/Unmute to flip my own muted state, so that I can signal speaking status (state-only per ADR-0001).
5. As a Participant, I want a participants panel with count and Me/Host labels, so that the roster is explicit.
6. As a Participant, I want an Invite action with a copyable link, so that I can pull others in mid-meeting.
7. As a Participant, I want Leave with a confirm step returning me to the dashboard, so that exits are deliberate.
8. As a Participant, I want the roster to refresh every 5s, so that joins/leaves/mutes appear without reload.
9. As a removed Participant, I want to be sent to the dashboard with a plain toast, so that ejection is unmistakable.
10. As the Host, I want Mute-all (non-hosts) and per-row Remove (never self/host), so that I can manage the room; as a Guest I want those controls hidden and the endpoints to reject me (403).
11. As the last person leaving, I want the Meeting to end automatically, so that rooms don't linger live forever.
12. As a mobile user, I want a 1–2 column tile grid, bottom-fixed toolbar, and full-sheet participants panel, so that the room works on a phone (bonus responsive).

## Implementation Decisions

- Tiles-only, no media capture or WebRTC of any kind (ADR-0001); muted state is a persisted flag, not audio control.
- Guard reads session storage for this Meeting Code; missing → redirect to name step (spec 03).
- All room mutations identify the caller via the participant header (ADR-0002); Host-only endpoints return 403 for Guests and reject self/host removal.
- Polling interval 5s against the participants listing; on poll, if self is gone/removed → dashboard + toast.
- Leave posts the leave action, clears the stored identity for that Code, routes to dashboard; last-active-leave triggers the ended transition server-side.
- Host Start from dashboard (spec 01) enters this same room as Host; guest early-join (ADR-0003) follows the identical guard.
- Responsive behavior is built into the room from the start (grid breakpoints, collapsing toolbar labels, drawer→sheet panel).

## Testing Decisions

- Test seams: the room-action endpoint contracts (participants list, self-mute, leave, mute-all, remove) at the API seam + room-guard/polling behavior with mocked API + Host-vs-Guest UI gating.
- What makes a good test: Guest sees no host controls and gets 403 from host endpoints; Remove ejects and blocks same-session re-entry; last leave ends the Meeting; missing identity redirects to name step; polling updates the roster.
- Prior art: API pattern (spec 00), component pattern (spec 01); minimal backend rule tests for host-only checks live with spec 00's suite.

## Out of Scope

Real audio/video, screen share, chat, reactions, recordings, whiteboard, waiting rooms, passcodes, breakout rooms, virtual backgrounds, network-quality indicators — anything beyond tiles + roster + host mute/remove.

## Further Notes

- Document in README: mute is state-only, polling (not sockets), header identity is not security.
- Verify on deployed URLs: deep-link an Invite into a second browser/session and confirm two tiles, mute-all, remove, and auto-end behave end to end.
