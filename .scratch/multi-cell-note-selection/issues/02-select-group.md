# 02: Drag or tap to select a group

**What to build:** With a finger or mouse, the player selects a group of incompleted cells and sees exactly which ones, and can cancel the batch. This is the gesture layer on top of the selection model.

**Blocked by:** 01 (Multi-cell selection model)

**Status:** done

- [x] Pressing and dragging across the board selects every incompleted cell the pointer sweeps over, and skips completed cells and givens in the path.
- [x] Notes mode switches on automatically the moment the drag selects a second incompleted cell; a drag that never reaches a second incompleted cell is released as an ordinary single-cell tap.
- [x] A plain tap (a press with no meaningful drag) behaves exactly as it does today: it single-selects that cell and leaves the manual notes toggle and the single-cell highlights unchanged.
- [x] While in cell selection, tapping an incompleted cell toggles it in or out of the selection.
- [x] While in cell selection, tapping a completed or given cell does nothing to the selection.
- [x] Each selected cell is shown with a dashed inset outline so the group is unmistakable.
- [x] While selecting, the row/column/box fill and the same-number / bold-notes highlighting are suppressed, so the board is not a wall of competing fills.
- [x] The batch is cancelled — selection cleared and the app back to normal single-cell behavior — by tapping outside the board, pressing Escape, toggling off the last selected cell, or pressing the Notes button (which reads as "clear selection" in this mode).
- [x] The gesture behaves the same with a mouse and with a touch, and the page does not scroll while a selection drag is in progress.

## Comments

- 2026-10-07: Implemented on `mcns-02`, merged to `multi-cell-note-selection` (commit `30c7700`). Board owns the Pointer-Event gesture (`touch-none`, per-cell `data-cell-index`, hit-test via `elementFromPoint`, 8px tap/drag threshold); selected cells render a dashed inset outline and the unit/bold highlighting is suppressed in the mode; Notes button + pad + keyboard route through `effectiveNotesMode`; exit via Escape, background click, Notes button, or emptying the set. **Browser-verified with Playwright** (mouse + CDP touch): plain tap unchanged, drag selects + Notes auto-on + no scroll, in-mode tap toggles, given-tap no-op, all four cancel paths, and an in-progress selection survives a reload. One deliberate deviation: the synthetic `click` fired by a cross-cell drag is suppressed so the background-clear gate doesn't wipe the just-built batch. Cross-set note/erase application and arrow-primary movement are left to ticket 03.
