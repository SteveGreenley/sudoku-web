# 02: Dark mode

**What to build:** A working dark mode that follows system preferences (or lets the user override to light/dark) with zero flash on initial load. The app reads `localStorage`, sets `data-theme` and `dark` class on `<html>` before the first paint via a pre-paint inline script (Next 16 pattern). A `useLayoutEffect` in a React hook re-applies after hydration (handles dev Strict Mode remounts).

Appearance is persisted in `localStorage["sudoku:appearance"]` with values `system | light | dark`. When `system`, the app follows `prefers-color-scheme`. Dark-mode override blocks define new values for all 18 tokens.

The 9-color same-number palette and mistake red stay fixed (no dark overrides for either).

**Blocked by:** 01 (semantic token layer)

**Status:** ready-for-agent

- [ ] Pre-paint inline script injected into `<head>`: reads localStorage, sets `data-theme` + `dark` class on `<html>` before first paint (no flash)
- [ ] React hook with `useLayoutEffect` re-applies values after hydration (handles dev Strict Mode remounts)
- [ ] Dark override blocks defined for all 18 tokens (CSS block keyed on `.dark` class)
- [ ] Appearance persisted in `localStorage["sudoku:appearance"]` (`system | light | dark`)
- [ ] When `system`, app follows `prefers-color-scheme`
- [ ] 9-color same-number palette and mistake red remain unchanged in dark mode
- [ ] In dark mode, no text renders in black: all text tokens (`text-strong`, `text-soft`, `text-muted`, `text-faint`, `inverse`, `text-blue-600`, `text-white`) are overridden in the dark mode blocks to use light/shade values appropriate to the theme (e.g. white or warm-slate for Ink, white for Classic/Emerald)
- [ ] Verify: every text element across all 7 components + layout is visible and readable in dark mode with no black text present
