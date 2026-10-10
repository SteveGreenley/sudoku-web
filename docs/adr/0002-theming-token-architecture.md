# ADR 0002: Theming — token architecture + axes

## Context

The sudoku game had no theming mechanism. All colors were hardcoded as Tailwind
utility classes (zinc neutrals, blue accent, red mistake) or inline hex values
(the 9-color same-number palette from ticket 05). The app needed support for
multiple color themes and a system / light / dark appearance mode.

## Decision

**18 semantic Tailwind v4 tokens** with a hand-rolled pre-paint script following
the [Next 16 docs](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration#themes).
Appearance (`system | light | dark`) is a separate axis from the theme
(`classic | emerald | ink`). Two exceptions: the 9-color same-number palette and
the mistake red color are fixed across all themes and modes.

### Token architecture

Each theme defines values for 18 CSS custom properties (`--color-*`). Tailwind v4
generates utilities (e.g. `bg-surface`) that reference these variables at runtime.
Theme overrides are defined as unlayered CSS blocks (higher specificity than
`@theme`) that override the variable values when a specific `data-theme`
attribute + `dark` class combination is active on `<html>`.

Components use **semantic tokens exclusively** (no `dark:` variants anywhere).
Theme changes are pure CSS variable swaps — no component-level re-rendering.

```
@theme { --color-surface: #ffffff; }  → bg-surface { background-color: var(--color-surface); }
                                                        ↓ (runtime override)
.dark { --color-surface: #27272a; }  → dark mode uses #27272a for all bg-surface
```

### Appearance axis

`system | light | dark`. When `system`, the app follows the OS preference
(`matchMedia("(prefers-color-scheme: dark)")`). The value is persisted in
`localStorage["sudoku:appearance"]`.

### Pre-paint script

An inline script generated at build time is injected into `<head>` during SSR.
It reads `localStorage`, validates the theme name, resolves the appearance
against the system preference, and sets `data-theme` + `dark` class on `<html>`
**before the first paint**. This eliminates the flash of the wrong theme.

A `useLayoutEffect` in the React hook re-applies the values after hydration
(to handle dev Strict Mode remounts). The script and the hook read the same
source (`localStorage`) so they always agree, per the Next 16 doc pattern.

### Exceptions

**Mistake red** — the placed value ≠ solution feedback is red in every theme.
ADR 0001 defines red as the universal mistake signal. Themed mistakes would
force every theme to revalidate the palette's distinguishability.

**9-color same-number palette** — fixed across all themes and modes (ticket 05
design). The palette was explicitly designed to be "mutually distinguishable,
and clear of the app's blue selection/highlight fills, red mistake color, and
zinc neutral colors." It stays as inline hex styles (applied via the
`sameNumberStyle` function).

### Rationale (why hand-rolled)

The Next 16 docs describe exactly this pattern (no external package needed).
`next-themes` would only cover the light/dark axis — the multi-theme axis
would still require a hand-rolled solution. The repo stays dependency-free.

## Consequences

- Adding a new theme is a one-file change: append 2 override blocks to
  `themes.css`. No component changes.
- Classic + light is pixel-identical to the current app (zero visual change
  for existing users).
- The 18-token system is extensible: new tokens can be added to `@theme` and
  all components automatically inherit them.
- Dark mode validation: each new theme must be checked that its accent family
  remains hue-distinguishable from the 9-color same-number palette (see
  ticket 03 design constraints).
