# 03: Apply and erase notes across the selection

**What to build:** Once a group of incompleted cells is selected, the player stamps a note across all of them in one action and can clear it the same way. The batch note/erase operations are tested at the module seam; the pad, keyboard, and Erase wiring is verified manually.

**Blocked by:** 01 (Multi-cell selection model), 02 (Drag or tap to select a group)

**Status:** done

- [x] While one or more cells are selected, pressing a number on the number pad toggles that note in every selected cell at once: a cell that already has the note loses it, a cell without it gains it.
- [x] The keyboard (1–9) applies the same across-the-selection note toggle while in cell selection.
- [x] A number already complete in a row, column, or box stays disabled and cannot be noted, even in cell selection.
- [x] The Erase button (and Backspace) clears notes from every selected cell at once, leaving non-selected cells untouched.
- [x] Arrow keys move the primary cell.
- [x] Number placement itself remains single-cell (it acts on the primary cell only); there is no multi-cell number placement.
- [x] Applying or erasing a note never changes the selection membership itself — a cell does not leave the selection just because its notes changed.

## Comments

- 2026-10-07: Implemented on `mcns-03`, merged to `multi-cell-note-selection` (commit `74e2e79`). Three module actions — `applyNoteToSelection` (per-cell toggle across the set), `eraseSelection` (clear notes on all selected), `movePrimary` (re-point the primary without collapsing the set) — with 28 new vitest cases (105 total, all green). Pad, keyboard 1–9, Backspace, and arrow keys route through these while in the mode; placement stays single-cell; complete numbers stay disabled on the pad. **Browser-verified** (Playwright): pad/keyboard stamp across all dashed cells, arrow grows the group, erase clears all, a complete digit stays disabled, and the group + notes survive a reload. This also fixes ticket 02's arrow-keys-collapsed-the-set issue (arrows now use `movePrimary` in the mode).
- 2026-10-07: **Flagged a pre-existing bug** surfaced during verification — resuming a saved game whose difficulty differs from the UI default ("easy") makes the `difficulty` change-effect in `src/app/page.tsx` start a *new* game, discarding the resume (and any persisted multi-selection). The `loadedFromPersistence` guard exists but is never consulted. This breaks story 13 for non-default difficulties and is being fixed in the review/fix pass.
