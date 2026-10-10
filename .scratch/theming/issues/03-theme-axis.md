# 03: Additional themes

**What to build:** Two new color themes — Emerald (green accent) and Ink (near-monochrome warm-slate). Each theme defines its own values for all 18 semantic tokens. Theme is stored in `localStorage["sudoku:theme"]` with values `classic | emerald | ink`.

Switching themes instantly swaps the entire app's color scheme via CSS variable overrides — no component re-rendering required. The 9-color same-number palette and mistake red stay fixed across all themes.

Classic (default) = today's exact look. Emerald = green accent. Ink = near-monochrome warm-slate with a subtle accent.

**Blocked by:** 01 (semantic token layer)

**Status:** ready-for-agent

- [ ] Emerald theme (green accent) defines override blocks for all 18 tokens
- [ ] Ink theme (warm-slate) defines override blocks for all 18 tokens
- [ ] Theme persisted in `localStorage["sudoku:theme"]` (`classic | emerald | ink`)
- [ ] Classic remains the default when no theme is selected
- [ ] 9-color same-number palette and mistake red remain unchanged across all themes
- [ ] Each theme's accent family remains hue-distinguishable from the 9-color same-number palette
