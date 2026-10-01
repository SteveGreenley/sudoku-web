# 05: Highlights and bold

**What to build:** Selecting a cell orients the player. The selected cell's row, column, and box are filled with a subtle tint; the selected cell itself gets the strongest fill; and every other instance of that cell's number on the board renders bold (givens and placed alike, mistaken or not). Selecting a cell that holds only notes still fills its row, column, and box, with no bolding (there is no number to match). Highlight sets are derived from the selection on every render, never stored. At a glance a player sees the scope of a cell's constraints and where its number already lives.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** done

- [x] Selecting a cell fills its row, column, and box (lighter `bg-blue-100`)
- [x] The selected cell receives the strongest fill (`bg-blue-300`)
- [x] Every other cell holding the same number as the selected cell renders bold (givens and placed alike, mistake or not)
- [x] Selecting a cell with notes but no number fills its row, column, and box with no bolding
- [x] Highlight sets are derived on selection and no highlight state is stored (pure computation)
- [x] Derivations are tested at the module seam (row/column/box membership, bold set, notes-only case)

## Comments

- 2026-10-01: Implemented. Pure `computeHighlights(state)` returns `highlighted: Set<number>` (row/col/box of selected, excluding selected itself) and `bold: Set<number>` (other cells with the same number as selected, empty when selected has no number). Board computes once per render, passes `isHighlighted`/`isSameNumber` props to Cell. Cell applies `bg-blue-100` for highlighted cells (lighter than selected's `bg-blue-300`), `font-bold` for same-number cells. 28 tests pass, lint clean.
