# 02: A drag never drags in a pre-selected filled cell

**What to build:** If a filled cell (holding a number, placed or given) is single-selected in normal mode and the player then drags across incompleted cells to start a batch, the filled cell must not end up in the batch: it gets no selection marker, is not the primary, and batch note/erase never touches it. The batch contains exactly the incompleted cells the drag sweeps. Root cause: a normal-mode single-select mirrors the tapped cell into the batch set, and the drag then grows that set, pulling the filled cell in with it (a batch erase would wipe its number).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Single-select a placed number (or given), then drag across incompleted cells: the filled cell is not in the selection — no dashed marker, no batch fill — and the batch holds exactly the incompleted cells swept.
- [x] The primary is the last swept cell, and cell selection mode turns on once the batch reaches two cells, exactly as today.
- [x] Applying a note across the batch (number pad or keyboard) and the Erase button never add or erase on the pre-selected filled cell.
- [x] An already-built batch of incompleted cells is unaffected: starting a new drag that sweeps more cells keeps the existing incompleted members.
- [x] A plain tap (no drag) on a filled cell still single-selects it as today; a plain tap on an incompleted cell still single-selects it.
- [x] The fix lives in the pure game module's batch-growth action: when a batch is started from normal mode, any non-incompleted members of the pre-existing set are pruned before adding, with unit tests at the module seam for the filled-single-select-then-grow and incompleted-single-select-then-grow cases.

## Comments

- 2026-10-08: Implemented on `selection-and-shading`. `addSelectedCells` prunes non-incompleted members of the pre-existing set when starting a fresh batch (mode flag off); in cell-selection mode the batch is kept as-is. A sweep that adds nothing still returns the input state untouched (identity), so the board's tap-release fallback is preserved. No UI change needed — the gesture, dashed marker, and batch ops all read `selectedCells`. 8 new module-seam tests; full suite 122 passing, tsc + lint clean.
