# Spec 01 — Dashboard (Upcoming + Recent)

Status: ready-for-agent

## Problem Statement

As the Default User, I need a Zoom-like home page where I can see what's coming up, what happened recently, and launch the three core actions, so that the whole product feels like one coherent meeting hub.

## Solution

A web-client-home Dashboard: shared top bar (wordmark, search placeholder, notification placeholder, Default User avatar with static placeholder menu — no sign-in/out), icon rail (Home active, Meetings, Settings), live clock block, three action tiles (New Meeting, Join, Schedule), and a Meetings card with Upcoming | Recent tabs, rows, empty states, and per-row Start / Copy Invite Link actions.

## User Stories

1. As the Default User, I want to see my name/avatar from the default-user endpoint in the top bar, so that the page feels logged-in without any auth.
2. As the Default User, I want a live clock (time + date from the browser), so that the home feels alive.
3. As the Default User, I want three unmissable tiles (New Meeting, Join, Schedule), so that I can start any flow in one click.
4. As the Default User, I want Upcoming and Recent tabs, so that future and past Meetings are separated.
5. As the Default User, I want each Upcoming row to show title, date/time (my local zone), duration, and Meeting Code (spaced display), so that I can identify Meetings at a glance.
6. As the Host, I want a Start action on Upcoming rows, so that I can enter the Meeting Room as Host.
7. As the Host, I want a Copy Invite Link action, so that I can share the computed Invite Link.
8. As the Default User, I want live Meetings badged "Live", so that I can tell what is happening now.
9. As the Default User, I want Recent rows (title, date, duration, Meeting Code), so that I can recall past Meetings.
10. As the Default User, I want illustrated empty states ("No meetings scheduled." / "No recent meetings."), so that a fresh account doesn't look broken.
11. As the Default User, I want the lists to refresh after I create or schedule a Meeting, so that I never stare at stale data.
12. As a mobile user, I want the rail/tiles/rows to collapse gracefully below tablet width, so that the Dashboard is usable on a phone (bonus responsive).

## Implementation Decisions

- Layout follows the locked reference: web client home; the single shared top bar + icon rail is used here and reused on Join/Schedule (Q2 amendment to D19).
- All data fetching happens client-side in the browser; no backend calls at build time (a sleeping backend must not break the frontend build).
- Internal navigation uses framework-native links/router, never full reloads.
- Upcoming/Recent definitions and ordering come from the backend contract (spec 00); the frontend only renders what the list endpoints return.
- Start on an Upcoming row enters the room flow as Host (see spec 05); Copy uses the computed Invite Link from the Meeting payload.
- Design tokens (Zoom blue/blue-dark, orange tile, muted text, borders, app background, radius) and the Lato typeface apply from the first component; own text/SVG wordmark only.
- Out-of-scope Zoom chrome (Recordings/Summaries/Notes cards, promos, calendar banners, Chat/Contacts rail items) is deliberately omitted.

## Testing Decisions

- Test seams: component level for rendering (given fixed list payloads) plus the list-endpoint contract from spec 00; no backend internals.
- What makes a good test: given an Upcoming payload show rows + Start/Copy; given empty payloads show empty states; tabs switch lists; no test on CSS values.
- Prior art: establish frontend component-test pattern here (mocked API seam), reuse in specs 02–05.

## Out of Scope

The `/meetings` page (dropped per Q4), real media, auth pages, search functionality (pill is a static placeholder), recordings/summaries/notes, upgrade promos.

## Further Notes

- Pixel pass against the reference screenshot happens after core works (polish phase) — structure markup now so spacing/colors can be tuned later without restructuring.
- Footer uses our own copyright line, never Zoom's.
