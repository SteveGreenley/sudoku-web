# 01: Clicking a filled number exits the note selection

**What to build:** While a batch of incompleted cells is selected for notes (cell selection mode), tapping a cell that holds a number — placed or given — exits cell selection and single-selects that cell: the batch is cleared, the notes-on behavior falls back to the stored manual Notes toggle, and the row/column/box fill plus the same-number highlight for the tapped number come back, exactly as if the cell had been tapped in normal mode. Today the tap is a silent no-op and the in-progress batch is kept, which is confusing.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] While in cell selection with a non-empty batch, tapping a placed (non-given) number clears the batch, ends cell selection, and selects that cell (it becomes the primary) — from that point the app behaves exactly as in normal mode: row/column/box + same-number highlighting visible, pad/keyboard input acts on that single cell.
- [x] Tapping a given while in cell selection behaves the same way: batch cleared, given single-selected, no placement attempted.
- [x] The existing normal-mode side effect of tapping a placed number is preserved on this path (re-placing the same number, including the note-erase in its row, column, and box).
- [x] Tapping an incompleted cell while in cell selection still toggles it in/out of the batch, unchanged.
- [x] After exiting this way, the Notes button reflects the stored manual toggle again (not forced on), and the saved state round-trips the transition correctly through a reload.
- [x] The transition lives in the pure game module's cell-selection action (the board's tap routes through it), with unit tests at the module seam covering: tap placed number in mode, tap given in mode, tap incompleted in mode, and the resulting batch/primary/mode-flag state for each.

## Comments

- 2026-10-08: Implemented on `selection-and-shading`. `toggleSelectedCell` exits cell selection via `select(state, cell)` when a tapped cell holds a number (placed or given); outside the mode it stays a no-op. The UI `onTapCell` now shares one select/toggle step plus the existing re-place guard across both modes, so exiting via a placed number gets the identical note-erase side effect and end state as a normal-mode tap. 7 new module-seam tests (incl. save/load round-trip of the transition); full suite 114 passing, tsc + lint clean.
