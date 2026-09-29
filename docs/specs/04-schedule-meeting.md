# Spec 04 — Schedule Meeting

Status: ready-for-agent

## Problem Statement

As the Default User, I want to plan a Meeting for later with a topic, time, and duration, so that it waits for me in Upcoming with a shareable link.

## Solution

A full schedule page (portal-style content on the shared shell): Topic (required, default "My Meeting", pre-selected on focus), expandable Description, date + time + AM/PM controls, duration selects (default 0 hr 40 min), read-only browser timezone label, "Generate Automatically" Meeting ID (only option), Save/Cancel. Save validates (title required, start in future, duration > 0), persists via the schedule endpoint, and shows a success state with details + Copy Invite Link; the Meeting appears in Upcoming.

## User Stories

1. As the Default User, I want a Topic field with a sensible default, so that scheduling is fast.
2. As the Default User, I want an "Add Description" reveal, so that the form stays compact unless I need it.
3. As the Default User, I want date/time/AM-PM pickers plus hr/min duration selects, so that I can set exactly when and how long.
4. As the Default User, I want to see my browser timezone as read-only text, so that I know which zone my picks are in.
5. As the Default User, I want Meeting ID always auto-generated, so that I never think about IDs.
6. As the Default User, I want Save blocked with inline errors for empty title, past start, or zero duration, so that mistakes are caught early.
7. As the Default User, I want a success state with the details and a Copy Invite Link button, so that I can share immediately.
8. As the Default User, I want the new Meeting in Upcoming right away, so that dashboard and schedule agree.
9. As the Default User, I want Cancel to abandon without creating anything, so that exploration is safe.
10. As a mobile user, I want the two-column rows to stack, so that the form is usable on a phone (bonus responsive).

## Implementation Decisions

- Times are selected in browser-local wall time, converted to UTC for the schedule payload; backend rejects past starts (422) and the frontend pre-validates with the same rule.
- Title/description length limits enforced on both sides (≤200 / ≤2000); duration > 0 enforced on both sides.
- Success state is a distinct view (not a toast), showing title, local start, duration, Meeting Code display form, and Invite Link copy.
- Zoom-only rows (templates, whiteboard/docs, security/passcode/waiting room, encryption, chat/video toggles, recurring, invitees, plan warnings) are omitted deliberately.
- Shared top bar + icon rail (Q2); content layout borrows portal spacing (label column + control column) without duplicating a second nav system.

## Testing Decisions

- Test seams: the schedule endpoint contract (API seam) + form behavior with mocked API + local-to-UTC conversion helper (pure unit seam).
- What makes a good test: empty title blocked; past start blocked; zero duration blocked; valid save → success view with copyable link; Cancel → no create call, back to dashboard.
- Prior art: API pattern (spec 00), component pattern (spec 01), pure-helper pattern (spec 03 parsing helper).

## Out of Scope

Recurring Meetings, invitee emails/calendar, waiting rooms/passcodes, templates, editing or deleting a scheduled Meeting (not requested — Start/Copy only), `/meetings` page (dropped per Q4).

## Further Notes

- Default duration 40 min is locked (Q9); expose hr/min selects with that default selected.
- If edit/delete-scheduled is ever requested, that's a new spec — do not sneak it in here.
