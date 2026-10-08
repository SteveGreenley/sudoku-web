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

`addSelectedCells` in `src/game/actions.ts` (line 203-222): when `cellSelectionMode` is `false` (normal mode), the function now starts with an empty set instead of filtering `selectedCells` for incompleted cells. The sweep starts empty, so the dragged cells form the batch on their own.

### Tests updated

- `selection.test.ts:203-216` — replaced "keeps the pre-selected cell when it is incompleted" with "a fresh batch from normal mode discards the pre-selected incompleted cell" and added a second test for multi-cell fresh batches.
- `selection.test.ts:192-200` — updated "keeps growing across subsequent sweeps" to "each sweep from normal mode starts fresh" with corrected expectations.
- `selection.test.ts:766-777` — updated mode-flag lifecycle test to use a two-cell sweep that correctly triggers cell-selection mode.

### Verification

All 147 tests pass. The following scenarios verified as still working:

- Drag on a filled cell from normal mode — filled cell pruned, sweep starts fresh
- Extending an existing batch in cell-selection mode — pre-existing batch preserved
- Single-cell drag from normal mode — mode stays off
- Drag across a single incompleted cell from normal mode — mode stays off
