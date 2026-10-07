# 03: Apply and erase notes across the selection

**What to build:** Once a group of incompleted cells is selected, the player stamps a note across all of them in one action and can clear it the same way. The batch note/erase operations are tested at the module seam; the pad, keyboard, and Erase wiring is verified manually.

**Blocked by:** 01 (Multi-cell selection model), 02 (Drag or tap to select a group)

**Status:** ready-for-agent

- [ ] While one or more cells are selected, pressing a number on the number pad toggles that note in every selected cell at once: a cell that already has the note loses it, a cell without it gains it.
- [ ] The keyboard (1–9) applies the same across-the-selection note toggle while in cell selection.
- [ ] A number already complete in a row, column, or box stays disabled and cannot be noted, even in cell selection.
- [ ] The Erase button (and Backspace) clears notes from every selected cell at once, leaving non-selected cells untouched.
- [ ] Arrow keys move the primary cell.
- [ ] Number placement itself remains single-cell (it acts on the primary cell only); there is no multi-cell number placement.
- [ ] Applying or erasing a note never changes the selection membership itself — a cell does not leave the selection just because its notes changed.
