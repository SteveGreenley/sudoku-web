# 01: Multi-cell selection model

**What to build:** The game state gains a set of selected cells plus a cell-selection flag, and the game module can add, toggle, and clear cells in that set with the right invariants. This is the testable foundation for the drag-to-select feature: it is verified at the module seam and is not yet visible in the UI.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The game state holds a set of selected cells and a cell-selection flag alongside the existing single selected cell; both default to empty / off for a fresh game.
- [x] A cell can be added to, toggled in/out of, and removed from the selection by its position.
- [x] Only incompleted cells (no placed number) can enter the selection; a given or a cell holding a number is rejected and left out.
- [x] The primary (last-touched) cell is tracked; when it is set it is always a member of the selection, and in normal (non-cell-selection) mode the selection holds zero or exactly one cell.
- [x] The cell-selection flag turns on exactly when the selection holds two or more cells, and turns off when it empties.
- [x] While in cell selection, the effective notes mode is on whenever at least one cell is selected; the stored manual notes-mode toggle is left unchanged and re-applies when the mode ends.
- [x] A selected cell that gains a number (becomes completed) is removed from the selection.
- [x] The new fields round-trip through save and load, so an in-progress selection resumes after a reload.

## Comments

- 2026-10-07: Implemented on `mcns-01`, merged to `multi-cell-note-selection` (commit `4b262c2`). Added `selectedCells: number[]` and `cellSelectionMode: boolean` to `GameState`; pure actions `addSelectedCells`, `toggleSelectedCell`, `clearSelection` and a derived `effectiveNotesMode(state)` in `src/game/`; `select()` now mirrors a single-cell selection to hold the `selected` = last-element invariant. 35 new vitest cases in `src/game/selection.test.ts`; full suite green (77), lint + tsc clean. Note: normal-mode `select` may target any cell (givens/completed) and skips the incompleted guard by design — the guard governs the batch actions.
