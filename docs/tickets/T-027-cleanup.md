# T-027: Cleanup, lint/format, secret audit, interview notes

Priority: P1 — Depends on: T-020, T-022, T-026 (everything)

Status: ready-for-agent

## Context

Final gate: repo must be explainable line-by-line and leak nothing.

## Scope

Lint/format pass, `.env`/`.db` audit (untracked, example files only), dead-code removal, `docs/interview-notes.md` (schema, every endpoint, every component in plain explainable words).

## Out of scope

Behavior changes (anything found goes back to its ticket).

## Acceptance criteria

- [ ] Linters/formatters clean; no dead code or copied assets
- [ ] No `.env`, `.db`, secrets, or personal data in history or tree
- [ ] Interview notes cover schema, endpoints, components; human can rehearse from them alone

## Areas touched

Whole tree (hygiene only), interview notes doc.

## Notes

Last commit before submission; Render warmed after.
