# 02: Drag or tap to select a group

**What to build:** With a finger or mouse, the player selects a group of incompleted cells and sees exactly which ones, and can cancel the batch. This is the gesture layer on top of the selection model.

**Blocked by:** 01 (Multi-cell selection model)

**Status:** ready-for-agent

- [ ] Pressing and dragging across the board selects every incompleted cell the pointer sweeps over, and skips completed cells and givens in the path.
- [ ] Notes mode switches on automatically the moment the drag selects a second incompleted cell; a drag that never reaches a second incompleted cell is released as an ordinary single-cell tap.
- [ ] A plain tap (a press with no meaningful drag) behaves exactly as it does today: it single-selects that cell and leaves the manual notes toggle and the single-cell highlights unchanged.
- [ ] While in cell selection, tapping an incompleted cell toggles it in or out of the selection.
- [ ] While in cell selection, tapping a completed or given cell does nothing to the selection.
- [ ] Each selected cell is shown with a dashed inset outline so the group is unmistakable.
- [ ] While selecting, the row/column/box fill and the same-number / bold-notes highlighting are suppressed, so the board is not a wall of competing fills.
- [ ] The batch is cancelled — selection cleared and the app back to normal single-cell behavior — by tapping outside the board, pressing Escape, toggling off the last selected cell, or pressing the Notes button (which reads as "clear selection" in this mode).
- [ ] The gesture behaves the same with a mouse and with a touch, and the page does not scroll while a selection drag is in progress.
