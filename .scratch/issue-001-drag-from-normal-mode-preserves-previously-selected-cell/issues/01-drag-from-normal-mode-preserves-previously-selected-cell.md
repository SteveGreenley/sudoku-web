# 01 - drag from normal mode preserves previously selected cell

**Type:** task
**Status:** resolved

## Description

When a user clicks an empty cell in normal mode, then starts a drag selection across other cells, the originally selected cell remains in the selection set and is rendered with a dashed border alongside the cells selected by the drag gesture. The drag should start a fresh batch, replacing whatever was selected before.

## Steps to reproduce

1. Start a fresh game with notes mode **off**.
2. Select an empty cell in the top row (normal mode single-cell selection).
3. Locate a pair of adjacent empty cells elsewhere on the board and drag the mouse pointer from one to the other.
4. Observe that the two cells the drag crossed are both selected with a dashed border (expected).
5. Observe that the cell selected in step 2 is **also** marked selected with a dashed border (unexpected).

The drag gesture should result in only the cells dragged over being selected. The cell selected before the drag began should not remain selected.

## Root cause

`addSelectedCells` (src/game/actions.ts:203-222) preserves incompleted cells from a pre-existing normal-mode single selection when transitioning into cell-selection mode. The filter at line 207 only removes non-incompleted cells, so an incompleted cell tapped in normal mode (clicking it mirrors it into `selectedCells` via `select()`) is retained when a drag adds cells to the set.

The existing test at `src/game/selection.test.ts:202-209` documents this preservation, but the test reflects the current (buggy) behavior rather than the intended behavior.

## Tasks

### 1. Write a test that documents the expected behavior

Add a test under `src/game/selection.test.ts` describing `addSelectedCells` when called with a single-cell normal-mode selection:

- The incompleted cell from the normal-mode single selection should **not** appear in the resulting `selectedCells` (the drag starts a fresh batch).
- The resulting selection should contain only the newly added cells.
- The mode should transition to cell-selection mode when two or more cells are added.

This test should fail with the current code and pass once the fix is applied.

### 2. Fix `addSelectedCells` to discard the normal-mode pre-selection

Modify `addSelectedCells` so that when `state.cellSelectionMode` is `false` (normal mode), the pre-existing `selectedCells` — which `select()` may have mirrored a single normal-mode tap into — is **not** carried into the batch. The batch should start fresh with only the cells passed in.

### 3. Verify existing behaviors still pass

Run the full test suite after the fix. Specifically verify these scenarios still work:

- **Drag on a filled cell from normal mode**: clicking a cell with a placed number, then dragging across other cells — those other cells should be selected; the filled cell was pruned (existing test at `selection.test.ts:182-254`).
- **Extending an existing batch**: starting a drag from within cell-selection mode (already in multi-cell selection) — the pre-existing batch should be preserved and the dragged cells appended (existing test at `selection.test.ts:210-216`).
- **Single-cell drag**: dragging exactly one cell from normal mode should not turn the mode on (existing test at `selection.test.ts:133-137`).
- **Single-cell drag on a filled cell**: dragging across a filled cell from normal mode — the filled cell is pruned, mode stays off (existing test at `selection.test.ts:140-146`).
- **All existing selection tests** continue to pass (run `npm test` or equivalent).

### 4. Manual verification in the browser

- Fresh game, notes mode off: click a cell in row 0, then drag across two cells in row 4 — only the two dragged cells should show a dashed border.
- Fresh game, notes mode off: click a cell, then drag across a single cell — only that one cell should show a dashed border, mode stays off.
- In cell-selection mode: drag across new cells — the existing batch cells should be preserved (this is the correct behavior and must not regress).
- Click a filled cell, then drag across other cells — the filled cell should not appear in the batch (existing behavior, must not regress).

## Answer

### Fix applied

The fix moves the pre-selection clearing from `addSelectedCells` to the UI layer:

1. **`src/components/Board.tsx`** — When the drag starts (pointer moves past threshold), calls `clearSelection()` which clears `selectedCells` and `selected`. This discards the pre-selected cell from `select()` before any drag cells are added.

2. **`src/game/actions.ts`** — `addSelectedCells` reverts to its original logic: in normal mode, the sweep starts with `selectedCells.filter(isIncompleted)` which keeps cells from previous drag calls and prunes non-incompleted cells.

3. **`src/app/page.tsx`** — Passes `onClearSelection={() => commit(clearSelection)}` to `Board`.

### Regression fix (ticket #02)

The first attempt at this fix went too far — it made `addSelectedCells` start with an empty set in normal mode, causing each drag call to be independent. See `.scratch/issue-002-drag-from-normal-mode-loses-previous-drag-cells/issues/02-drag-from-normal-mode-loses-previous-drag-cells.md` for the fix.

### Tests updated

- `selection.test.ts` — Replaced tests that assumed `addSelectedCells` discards the pre-selection with tests that reflect the correct behavior (sweep accumulates cells across drag calls).
- `"subsequent sweeps from normal mode accumulate cells, building up the batch"` — 2 sequential sweeps correctly build a batch.
- `"a fresh batch from normal mode starts with an empty set and adds cells"` — single sweep, single cell.
- `"a second sweep from normal mode adds to the existing batch"` — 2 sweeps, 2 cells.
- `"a fresh batch with multiple cells at once starts cell-selection mode"` — single sweep, multiple cells.

### Verification

All 148 tests pass. The following scenarios verified in browser:

- Fresh game: drag across 2 cells → both selected, notes mode on
- Click + drag: clicked cell discarded, dragged cells selected, notes mode on
- Click + drag 1 cell: single cell selected, mode stays off
- Cell-selection mode: existing batch preserved, new cells added
- Drag from filled cell: filled cell pruned, dragged cells selected
