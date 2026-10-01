# 03: Selection, placement, and mistake feedback

**What to build:** The player can interact with the puzzle. Clicking or tapping a cell selects it (arrow keys move the selection); givens are selectable but never editable. An always-visible number pad (1–9, beside the board on desktop and below it on mobile) and keyboard 1–9 place a number into the selected cell, overwriting an existing placed number. A number that does not match the solution for that cell stays on the board but is shown red — a mistake — with the red state derived, never stored. A player at a desk or on a phone can play, and is told immediately when they err.

**Blocked by:** 02 (Puzzle generation and new game)

**Status:** done

- [x] Click/tap selects a cell, and the selected cell is visibly distinguishable
- [x] Arrow keys move the selection (Up/Down/Left/Right)
- [x] The number pad is always visible (below the board) and places a number in the selected cell
- [x] Keyboard 1–9 places a number in the selected cell
- [x] Placing a number clears the cell's notes and overwrites any existing placed number
- [x] Givens ignore placement
- [x] A placed number different from the solution for that cell renders red; a matching number renders normally (blue)
- [x] Mistake (red) state is derived from board vs solution, never stored
- [x] Placement rules are tested at the module seam (place, overwrite, givens untouchable, red derivation)

## Comments

- 2026-10-01: Implemented. `Cell.tsx` now derives mistake state: non-given values that don't match the solution render red (`text-red-500`), matching values render blue (`text-blue-600`). Givens remain `font-semibold text-zinc-900`. New `NumberPad.tsx` component renders 9 number buttons (1–9) below the board. `page.tsx` wired with `place()` action, keyboard handling (1–9 places, arrow keys navigate selection, backspace ready), and NumberPad integration. Lint passes, 24 tests pass.
