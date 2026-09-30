# 05: Highlights and bold

**What to build:** Selecting a cell orients the player. The selected cell's row, column, and box are filled with a subtle tint; the selected cell itself gets the strongest fill; and every other instance of that cell's number on the board renders bold (givens and placed alike, mistaken or not). Selecting a cell that holds only notes still fills its row, column, and box, with no bolding (there is no number to match). Highlight sets are derived from the selection on every render, never stored. At a glance a player sees the scope of a cell's constraints and where its number already lives.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** ready-for-agent

- [ ] Selecting a cell fills its row, column, and box
- [ ] The selected cell receives the strongest fill, distinct from the row/column/box tint
- [ ] Every other cell holding the same number as the selected cell renders bold, whether given or placed and whether a mistake or not
- [ ] Selecting a cell with notes but no number fills its row, column, and box with no bolding
- [ ] Highlight sets are derived on selection and no highlight state is stored
- [ ] Derivations are tested at the module seam (row/column/box membership, bold set, notes-only case)
