# T-009: Frontend scaffold, design tokens, font, base UI components

Priority: P0 — Depends on: none (frontier)

Status: done

## Context

Greenfield Next.js App Router + TypeScript + Tailwind, fully custom (Q11). Every page needs tokens and primitives first.

## Scope

App scaffold, Zoom tokens (blue/blue-dark, orange, text/muted, borders, app bg, room darks, danger, radius), Lato via next/font, base Button/Input/Select/Modal/Toast, SPA convention (all pages client-rendered, no build-time backend fetch).

## Out of scope

Features, API wiring (T-010), pages.

## Acceptance criteria

- [ ] Production build succeeds with no backend running (no build-time fetch)
- [ ] Tokens render on a style sanity page; Lato applied; no copied Zoom assets (own wordmark)
- [ ] Base components cover button/input/select/modal/toast with hover/focus/disabled states

## Areas touched

App scaffold, global styles/tokens, font, UI primitives.

## Notes

Mobile-first Tailwind from the first component (responsive bonus rides along).
