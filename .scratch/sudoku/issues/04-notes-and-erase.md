# 04: Notes and erase

**What to build:** The player can annotate and correct. A notes-mode toggle on the controls row switches pad input: in notes mode, pressing a number adds or removes that note on the selected empty cell (notes exist only on empty cells, are never validated against the solution, and render as a small grid of digits inside the cell). An Erase button and Backspace clear the selected cell — a cell holding a number loses the number; an empty cell loses its notes. When a placement matches the solution, that number is removed from the notes of every other cell in its row, column, and box; a mistaken placement erases nothing. A player can track possibilities per cell, watch them clean up automatically as they solve, and correct themselves.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** done

- [x] The controls row includes a notes-mode toggle with visible on/off state
- [x] In notes mode, pad input on an empty cell adds or removes that note (toggle behaviour)
- [x] Notes render as a small grid of digits (3x3 grid) inside the cell
- [x] Notes exist only on empty cells and are never validated against the solution
- [x] The Erase button and Backspace clear the selected cell's number, or its notes if the cell is empty
- [x] A placement matching the solution removes that number from the notes of every other cell in its row, column, and box
- [x] A mistaken placement changes no notes anywhere
- [x] All of the above is tested at the module seam, including the auto-erase and no-erase-on-mistake rules

## Comments

- 2026-10-01: Implemented. `place()` now auto-removes a placed number from notes of all cells in the same row, column, and box (but not on mistakes — matching only). `erase()` updated for partial clearing: clears the number from cells holding one, or notes from empty cells. New `Controls.tsx` exports `NotesToggle` (pill with ON/OFF state) and `EraseButton` on a control row. NumberPad respects `notesMode`: when ON, buttons call `toggleNote()` (add/remove from notes); when OFF, calls `place()`. Keyboard 1–9 routed through `notesMode` flag (toggleNote vs place). Notes rendered as 3x3 mini grid of small numbers inside cells when no placed number. Lint passes, 24 tests pass.
