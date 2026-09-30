# 03: Selection, placement, and mistake feedback

**What to build:** The player can interact with the puzzle. Clicking or tapping a cell selects it (arrow keys move the selection); givens are selectable but never editable. An always-visible number pad (1–9, beside the board on desktop and below it on mobile) and keyboard 1–9 place a number into the selected cell, overwriting an existing placed number. A number that does not match the solution for that cell stays on the board but is shown red — a mistake — with the red state derived, never stored. A player at a desk or on a phone can play, and is told immediately when they err.

**Blocked by:** 02 (Puzzle generation and new game)

**Status:** ready-for-agent

- [ ] Click/tap selects a cell, and the selected cell is visibly distinguishable
- [ ] Arrow keys move the selection
- [ ] The number pad is always visible (beside the board on desktop, below on mobile) and places a number in the selected cell
- [ ] Keyboard 1–9 places a number in the selected cell
- [ ] Placing a number clears the cell's notes and overwrites any existing placed number
- [ ] Givens ignore placement
- [ ] A placed number different from the solution for that cell renders red; a matching number renders normally
- [ ] Mistake (red) state is derived from board vs solution, never stored
- [ ] Placement rules are tested at the module seam (place, overwrite, givens untouchable, red derivation)
