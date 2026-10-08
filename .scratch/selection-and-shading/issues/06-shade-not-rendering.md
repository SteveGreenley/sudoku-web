# 06: Same-number shade not rendering on board

**What to investigate:** When a cell with a value (e.g., "3") is selected, the same-number cells should get a background shade (amber for value 3, lime for value 5, etc.). However, the cells show `#ddd6fe` / `#4c1d95` as raw text in the className (invalid Tailwind class names), even though the inline styles correctly render the violet shade.

The unit tests pass (palette colors are correctly returned by `sameNumberStyle`). The UI does render the shade via inline styles (verified: `background: rgb(221, 214, 254); color: rgb(76, 29, 149);`), but the hex values from the palette were also being appended as noise to the className string — they are not valid Tailwind classes and served no purpose.

**Steps to reproduce:**
1. Start a new game (Easy)
2. Click on a cell with value "9" (e.g., cell 4, Row 1, column 5)
3. Observe (via DevTools DOM inspection): selected cell className contains `#ddd6fe` and `#4c1d95` as raw text (not Tailwind classes)
4. Expected: className contains only Tailwind classes; palette hex values appear only in inline styles

**Acceptance criteria:**
- [x] Selecting a cell with a value applies the correct shade (dark variant) to the selected cell via inline styles
- [x] Selecting a cell with a value applies the light shade to other same-number cells via inline styles
- [x] Different values get different shade colors (value 9 = violet)
- [x] The shade replaces the blue selection fill for the selected cell (inline style takes precedence)
- [x] The shade wins over the row/column/box fill (blue-100) for other same-number cells (inline style takes precedence)

**Root cause:** `Cell.tsx` was appending `sameNumber.background` and `sameNumber.textColor` directly to the className string. When the palette uses hex values (not Tailwind class names), these hex strings are invalid as class names and pollute the className with no effect. The inline styles (`bgStyle`, `colorStyle`) were already working correctly, but the hex values were also incorrectly placed in the className.

**Fix:** Updated `Cell.tsx` so that hex palette values are excluded from the className string (they go only in the inline styles). Tailwind class names (when the switch is "bold") still go in the className as before.

## Comments

- 2026-10-08: Fixed. `Cell.tsx` now checks if `sameNumber.background` and `sameNumber.textColor` are hex values (start with `#`) and excludes them from the className — they are only applied via the existing inline styles (`bgStyle`, `colorStyle`). Hex values in className were invalid Tailwind class names adding noise with no effect. Inline styles were already rendering the shade correctly; the fix cleans up the className. Full suite 146 passing, tsc + lint clean.

