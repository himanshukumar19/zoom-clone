# T-017: Room page (guard, dark layout, header, timer, tile grid)

Priority: P1 — Depends on: T-006, T-014

Status: done

## Context

Spec 05 part 1: a viewable room. Tiles-only per ADR-0001; guard per spec 03 contract.

## Scope

Route guard (no stored Participant → name step), dark shell, header (title, spaced Code, Invite/Info with copy, elapsed timer), responsive tile grid with initials avatar, name, Host tag, muted icon.

## Out of scope

Toolbar actions (T-018), panel/polling (T-019), host controls UI (T-020).

## Acceptance criteria

- [ ] Direct room URL without identity redirects to the name step
- [ ] Two sessions in one Meeting each see both tiles with correct names/tags/icons
- [ ] Header shows title/Code/invite/timer; grid collapses 1→N tiles
- [ ] No camera/mic permission prompts anywhere (nothing requests media)

## Areas touched

Room page, guard, header, tile grid.

## Notes

If this contradicts nothing in ADR-0001, proceed; else flag explicitly.
