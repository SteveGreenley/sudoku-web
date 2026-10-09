# 01: Undo history engine

**What to build:** The board remembers every change it makes. After each real change to the board or notes (a placement, a note, an erase, or a whole multi-cell batch), the game stores a lightweight snapshot of the board+notes it was in *before* that change. Undoing pops the most recent snapshot and restores the board+notes from it, leaving the clock, the selected cell, notes-mode, and the win status exactly as they are. There is no redo. Selection-only actions (moving the cursor, dragging, Escape) and the Notes ON/OFF toggle store nothing. The history is saved with the game (so it survives a refresh and can be undone back to the givens-only start) and is empty at the start of a game.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A `history` field (list of `{board, notes}` snapshots) on the game state, defaulting to empty; a new game starts with an empty history
- [x] Each content change (place, single-cell note, erase, multi-cell note batch, multi-cell erase) records exactly one snapshot equal to the pre-change board+notes
- [x] Selection-only actions and a no-op tap record nothing (a true no-op returns the same state)
- [x] Undo restores the popped snapshot's board+notes, removes that entry, and leaves clock, selection, notes-mode, and status unchanged; undo with an empty history or while solved is a no-op
- [x] Undoing all the way back to the start empties the history (givens-only board, all notes gone)
- [x] Undo-then-new-change abandons the undone branch (no redo)
- [x] The history is persisted with the game and back-fills to empty for a pre-feature save
- [x] All covered by tests at the module seam
