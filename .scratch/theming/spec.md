# Spec: Color themes + dark mode

Status: in-progress

## Problem Statement

Add support for multiple color themes and a system/light/dark appearance mode to the
sudoku game. Every color is currently hardcoded (zinc neutrals, blue accent, red
mistake, 9-color same-number palette). The app has no theming mechanism — no
next-themes, no CSS variables, no dark mode at all.

Constraints from prior work:
- 9-color same-number palette (ticket 05): each number 1–9 has a dark variant
  (selected cell) and light variant (other instances); deliberately chosen to be
  mutually distinguishable and clear of the app's blue selection/highlight fills,
  red mistake color, and zinc neutrals.
- Mistake feedback (ADR 0001): placed value ≠ solution renders red. The palette was
  designed to stay clear of red.
- Single-screen game: one route, no backend, no accounts.

## Domain language

Per `GLOSSARY.md`: board, cell, box, given, solution, mistake, note, cell selection,
primary. New terms below.

- **theme** — a named full color scheme: 18 semantic tokens (surfaces, text, lines,
  accents) with specific hex values. Classic = today's exact hexes; other themes
  define their own.
- **appearance** — the light/dark axis: `system | light | dark`. When `system`, the
  app follows `prefers-color-scheme`; `light` and `dark` override it.
- **token** — a semantic color variable (e.g. `--color-surface`). Tailwind v4
  generates utilities referencing these CSS variables, so runtime overrides change
  the whole app at once.

## Decisions

- **Theme = full color scheme** (surfaces, text, borders, accents all tokenized).
  No theme is a partial — every token gets a value per theme × mode.
- **Appearance is a separate axis** (`system / light / dark` × `classic / emerald /
  ink`). This is the standard pattern and avoids duplicating every theme's palette
  in both light and dark.
- **The 9-color same-number palette is fixed** in every theme and mode (the
  palette is a deliberate design, ticket 05). Its light variants (pale pastel
  backgrounds with dark text) read correctly on any board color.
- **Mistake color stays red across all themes** (a semantic exception to "full
  color scheme"). ADR 0001 intent: red = universal warning. Themed mistake would
  break the palette contract ("clear of red").
- **No new dependencies**. The Next 16 docs prescribe the exact pattern: a
  pre-paint inline script (reads localStorage, sets `data-theme` + `dark` class
  on `<html>` before paint), unlayered CSS override blocks, and a React hook with
  a `useLayoutEffect` re-apply (per the bundled doc for dev Strict Mode).
- **Classic + light is pixel-identical to the app as it stands** — zero visual
  change for existing users. Classic is the default.
- **Three themes ship in v1**: Classic (blue, today's look), Emerald (green
  accent), Ink (near-monochrome warm-slate).

## Tokens (18 semantic variables)

| token | Tailwind utility | Used for |
|---|---|---|
| `page` | `bg-page` | Page (body) background |
| `surface` | `bg-surface` | Cells, button fill, dialog cards |
| `surfaceHover` | `hover:bg-surface-hover` | Button cell hover |
| `surfaceDisabled` | `bg-surface-disabled` | Disabled number pad fill |
| `line` | `border-line` | Thin grid lines, button borders |
| `lineFaint` | `border-line-faint` | Disabled number pad border |
| `lineStrong` | `border-line-strong` | Thick grid lines, board frame |
| `ink` | `bg-ink border-ink` | Active (primary) button fill & border |
| `inkHover` | `hover:bg-ink-hover` | Active button hover fill |
| `inverse` | `text-inverse` | Text on dark fills (white in light, dark in dark) |
| `textStrong` | `text-strong` | Given numbers, dialog titles |
| `textSoft` | `text-soft` | Labels, dialog body, cancel buttons |
| `textMuted` | `text-muted` | Difficulty label, notes, settings icon |
| `textFaint` | `text-faint` | Disabled button text |
| `accent` | `text-accent bg-accent-fill` | Placed numbers, accent button text |
| `accentFill` | `bg-accent-fill` | Selected cell fill |
| `accentSoft` | `bg-accent-soft` | Row/column/box highlight fill |
| `accentOutline` | `outline-accent-outline` | Cell selection batch dashed outline |

## Tickets

- `01-semantic-token-layer` (no blockers)
- `02-dark-mode-axis` (blocked by 01)
- `03-theme-axis` (blocked by 01)
- `04-appearance-dialog` (blocked by 02, 03)

## Notes

- The inert `tailwind.config.ts` (v3 config, dead under v4) is deleted in ticket 1.
- The dead "palette (for Tailwind detection)" comment block in `sameNumberStyle.ts`
  is removed in ticket 1 (prevents Tailwind from generating unused utilities).
- The `page.tsx` `isClient` SSR flash flag remains (from `useLayout.ts`) and is
  unaffected by the theme system.
