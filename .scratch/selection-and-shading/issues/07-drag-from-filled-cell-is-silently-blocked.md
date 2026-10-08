# 07: Drag from a filled cell is silently blocked

**What to investigate:** Ticket `issues/02-drag-excludes-prior-filled-cell.md` claims to be implemented: "If a filled cell (holding a number, placed or given) is single-selected in normal mode and the player then drags across incompleted cells to start a batch, the filled cell must not end up in the batch: it gets no selection marker, is not the primary, and batch note/erase never touches it."

The unit tests at the module seam pass (the pure `addSelectedCells` function prunes filled cells correctly), but the UI does not work. When the player single-selects a filled cell (clicks a given or placed number), then attempts to drag across incompleted cells, the drag is silently blocked — no cells are selected, no batch is formed. The expected behavior is that the drag proceeds and sweeps the incompleted cells into the batch, but the original filled cell is pruned from the batch set.

**Steps to reproduce:**
1. Start a new game (Easy)
2. Click on a filled cell (a given like R1C1 showing "1", or a placed number)
3. Observe: the cell shows the blue selection fill (`bg-blue-300`) — it is single-selected
4. Now press and drag from that same filled cell across empty/incompleted cells (e.g., toward R3C5 and R4C6)
5. Expected: the incompleted cells swept by the drag should show dashed outlines (batch selection); the original filled cell should NOT have a dashed outline or be in the batch
6. Actual: nothing happens — no cells are selected, no batch forms, the board stays as it was

**Root cause:** In `Board.tsx`, `handlePointerDown` sets `canDragRef.current = !stateRef.current.givens[index] && stateRef.current.board[index] === 0`. When the starting cell is a given or has a number, `canDragRef.current` is `false`, and `handlePointerMove` immediately returns for that pointerId because of the guard `if (!canDragRef.current) return;`. The drag is entirely blocked, never reaching the `onAddSelected` callback.

The fix is in the UI layer: the drag should be allowed from a filled cell (set `canDragRef.current = true` even when starting from a filled cell), and the `onAddSelected` callback should receive the index of the filled starting cell. The pure `addSelectedCells` function already prunes it correctly when `cellSelectionMode` is off (it filters `state.selectedCells` to keep only incompleted members before adding new cells). The missing piece is wiring the UI to call `onAddSelected` for the filled starting cell as part of the drag.

**Acceptance criteria:**
- [ ] Click a filled cell (given or placed number) to single-select it (blue fill)
- [ ] Then press and drag from that cell across 2+ empty/incompleted cells
- [ ] The incompleted cells swept show dashed outlines (batch selection)
- [ ] The original filled cell does NOT show a dashed outline (it is not in the batch)
- [ ] The batch behaves correctly: applying a note or erasing across the batch does not touch the filled cell
- [ ] Dragging from a placed (non-given) number that was previously placed (not a given) also works the same way
- [ ] The module-seam unit tests already verify the pruning logic; no new module tests needed

## Comments

- 2026-10-08: UI verified via Playwright. Drag from filled cell 0 (given "1") resulted in `selectedCells=[]` and `cellSelectionMode=undefined`. Drag from empty cells 24→35 worked correctly (dashed outlines on both). Root cause: `Board.tsx:62-63` sets `canDragRef.current = !stateRef.current.givens[index] && stateRef.current.board[index] === 0`, blocking all drags that start on a filled cell.
