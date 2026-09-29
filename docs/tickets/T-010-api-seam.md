# T-010: API client, session helper, meeting-input parser, types

Priority: P0 — Depends on: T-009

Status: done

## Context

The frontend API seam every flow will use. Includes the pure input parser (spec 03) and session-storage identity (ADR-0002).

## Scope

Typed API client over `NEXT_PUBLIC_API_URL` (detail-envelope errors), participant-identity session helper keyed by Meeting Code, `parseMeetingInput` (spaced/raw/link → Code), shared Meeting/Participant types.

## Out of scope

Pages, hooks (polling lands with T-019).

## Acceptance criteria

- [ ] Parser unit tests: `123 456 7890`, `1234567890`, full Invite Link → same Code; garbage → clean failure
- [ ] Client surfaces 404/410/422/403 as typed errors the UI can message on
- [ ] Session helper stores/clears/loads participant identity per Code
- [ ] No hardcoded backend origin outside env

## Areas touched

API client lib, session lib, parser lib, shared types.

## Notes

Pure helpers stay unit-testable without rendering.
