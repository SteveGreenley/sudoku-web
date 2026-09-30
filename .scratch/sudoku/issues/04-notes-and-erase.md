# 04: Notes and erase

**What to build:** The player can annotate and correct. A notes-mode toggle on the controls row switches pad input: in notes mode, pressing a number adds or removes that note on the selected empty cell (notes exist only on empty cells, are never validated against the solution, and render as a small grid of digits inside the cell). An Erase button and Backspace clear the selected cell — a cell holding a number loses the number; an empty cell loses its notes. When a placement matches the solution, that number is removed from the notes of every other cell in its row, column, and box; a mistaken placement erases nothing. A player can track possibilities per cell, watch them clean up automatically as they solve, and correct themselves.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** ready-for-agent

- [ ] The controls row includes a notes-mode toggle with visible on/off state
- [ ] In notes mode, pad input on an empty cell adds or removes that note (toggle behaviour)
- [ ] Notes render as a small grid of digits inside the cell
- [ ] Notes exist only on empty cells and are never validated against the solution
- [ ] The Erase button and Backspace clear the selected cell's number, or its notes if the cell is empty
- [ ] A placement matching the solution removes that number from the notes of every other cell in its row, column, and box
- [ ] A mistaken placement changes no notes anywhere
- [ ] All of the above is tested at the module seam, including the auto-erase and no-erase-on-mistake rules
