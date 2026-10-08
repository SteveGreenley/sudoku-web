# 02 - drag from normal mode loses previous drag cells

**Type:** task
**Status:** resolved

## Description

My earlier fix (ticket #01) changed `addSelectedCells` to start with an empty set when in normal mode, so that a pre-selected cell from `select()` is discarded when a drag starts. However, this fix went too far: it discards ALL cells from `selectedCells`, including cells that were added during previous drag calls.

Since the UI calls `addSelectedCells` one cell at a time (once per cell passed during the drag), each call was independent — cells from previous drag calls were lost. Dragging across 3 cells resulted in only the last cell being selected, and notes mode never turning on.

## Steps to reproduce

1. Start a fresh game with notes mode **off**.
2. Drag your mouse cursor across two adjacent empty cells (cells 20 and 30).
3. Observe that **no cells are selected** and notes mode does not turn on. (Only the last cell dragged over is selected, and mode stays off.)

Expected: both cells should be selected (shown with dashed borders) and notes mode should turn on.

## Root cause

`addSelectedCells` (src/game/actions.ts:203-222) in my fix starts with an empty set (`set = []`) when `cellSelectionMode` is `false`. This means each call to `addSelectedCells` (which processes one cell from the drag) discards all cells from `selectedCells`, including cells added during previous drag calls. The sweep for the 2nd drag call starts with `[]` instead of `[firstCell]`, so only the last drag cell survives.

## How the fix works

The fix moves the pre-selection clearing from `addSelectedCells` to the UI layer (`Board.tsx`). When the drag starts (i.e., when the user's pointer moves past the threshold), the UI calls `clearSelection()`, which clears `selectedCells` and `selected`. Then subsequent drag calls add cells to the now-empty `selectedCells`, correctly building a batch.

The `addSelectedCells` function reverts to its original logic: in normal mode, the sweep starts with `selectedCells.filter(isIncompleted)` (which keeps cells from previous drag calls and prunes non-incompleted cells from the pre-selection).

## Verification tasks

### 1. Drag across cells from a fresh game (no prior click)
- Start a fresh game, notes mode off.
- Drag across two adjacent empty cells.
- **Verify**: both cells show with dashed borders, notes mode turns on.

### 2. Drag across cells after clicking a cell in normal mode (original bug)
- Start a fresh game, notes mode off.
- Click an empty cell in the top row (it gets a dashed border).
- Drag across two adjacent empty cells elsewhere on the board.
- **Verify**: the originally clicked cell no longer shows a dashed border (it was discarded), but the two dragged cells show with dashed borders and notes mode is on.

### 3. Drag across a single cell from normal mode
- Start a fresh game, notes mode off.
- Drag across a single empty cell.
- **Verify**: that single cell shows with a dashed border, notes mode stays off.

### 4. Extending an existing batch (cell-selection mode)
- Start a fresh game.
- Drag across two cells (notes mode turns on).
- Drag across additional cells.
- **Verify**: the new cells are added to the batch, all cells in the batch show with dashed borders.

### 5. Drag from a filled cell
- Start a fresh game.
- Click a cell that already has a number (filled cell).
- Drag across two empty cells.
- **Verify**: the filled cell is not in the batch (not shown with dashed border), but the two dragged cells are selected and notes mode is on.

### 6. Run the full test suite
- `npm test` should pass all 148 tests.

## Files changed

- **`src/game/actions.ts`** — `addSelectedCells` reverts to original logic: `set = state.cellSelectionMode ? [...state.selectedCells] : state.selectedCells.filter((i) => isIncompleted(state, i))`.
- **`src/components/Board.tsx`** — Added `onClearSelection` prop. When the drag starts (pointer moves past threshold), calls `onClearSelection()` to clear the pre-selected cell before any drag cells are added.
- **`src/app/page.tsx`** — Passes `onClearSelection={() => commit(clearSelection)}` to `Board`.
- **`src/game/selection.test.ts`** — Updated 5 tests to reflect the corrected behavior:
  - "a sweep from normal mode starts fresh, not extending a previous sweep's result" → "subsequent sweeps from normal mode accumulate cells, building up the batch"
  - "a fresh batch from normal mode discards the pre-selected incompleted cell" → "a fresh batch from normal mode starts with an empty set and adds cells"
  - "discards a normal-mode pre-selection and starts fresh with multiple cells" → "a fresh batch with multiple cells at once starts cell-selection mode"
  - Added "a second sweep from normal mode adds to the existing batch"
  - "keeps the mode flag on while the set is trimmed to one cell, and off when it empties" → simplified to use a single sweep
