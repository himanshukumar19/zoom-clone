# T-011: Layout shell (top bar + icon rail)

Priority: P0 — Depends on: T-009

Status: done

## Context

Spec 01 chrome, shared on every page per Q2 (single TopNav + IconRail, overriding portal-bar variant).

## Scope

Top bar (wordmark + Workplace, search pill placeholder, bell placeholder, Default User avatar from default-user endpoint with static placeholder menu — no sign in/out) and icon rail (Home active, Meetings, Settings bottom; no Chat/Contacts).

## Out of scope

Clock/tiles (T-012), page content, real search/notifications.

## Acceptance criteria

- [ ] Shell renders on all routes with avatar name from the default-user endpoint
- [ ] Avatar menu is a static placeholder with no auth items
- [ ] Internal nav uses links/router, no full reloads

## Areas touched

Layout components, top bar, icon rail.

## Notes

Settings/Meetings rail entries may be visual-only until their pages exist.
Note: T-023 (/meetings P2 page) was originally dropped but the /meetings page now exists as a static placeholder using MeetingsCard (see T-011).
