# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root (single-context repo — no `CONTEXT-MAP.md`)
- **`docs/adr/`** — read ADRs that touch the area you're about to work in (currently: tiles-only room, no-auth identity, early-join lifecycle)

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-tiles-only-room.md
│   ├── 0002-no-auth-identity.md
│   └── 0003-early-join.md
├── docs/specs/
└── .scratch/
```

## Use the glossary's vocabulary

When output names a domain concept (issue title, refactor proposal, hypothesis, test name), use the term as defined in `CONTEXT.md`: Default User, Meeting, Meeting Code / Meeting ID, Invite Link, Host, Guest / Participant, Display Name, Upcoming, Recent, Meeting Room, Dashboard. Don't drift to synonyms the glossary avoids (e.g. don't say "room ID" for Meeting Code, "user" for Guest).

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0001 (tiles-only room) — but worth reopening because…_
