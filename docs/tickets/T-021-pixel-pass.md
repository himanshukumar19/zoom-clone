# T-021: Pixel pass against reference screenshots

Priority: P1 — Depends on: T-013, T-015, T-016

Status: done

## Context

Assignment grades visual similarity. Structure exists; now sample real values and tighten states.

## Scope

Color/spacing/typography alignment for dashboard, join, schedule (focus/hover/disabled rings included); own umbrella empty-state SVG; own copyright line; blur/crop any personal data if reference screenshots are committed.

## Out of scope

New features, responsive (T-022), room restyle (already dark-simple by design).

## Acceptance criteria

- [ ] Dashboard/join/schedule visually match references at desktop width (eyeball QA with screenshots)
- [ ] Focus, hover, and disabled states present on all inputs/buttons
- [ ] No Zoom logos/assets copied; wordmark is own text/SVG

## Areas touched

Styles, dashboard/join/schedule components, empty-state art.

## Notes

Colors in plan §8.0 are approximations — sample real values now.
