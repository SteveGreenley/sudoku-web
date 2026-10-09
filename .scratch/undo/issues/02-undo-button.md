# 02: Undo button

**What to build:** An Undo button appears in the row above the board, alongside the Notes toggle and New Game. It is disabled and greyed out when there is nothing to undo (at game start, and after undoing back to the start) and enabled otherwise. Tapping it performs one undo step, reverting the last change to the board and notes.

**Blocked by:** 01 (Undo history engine)

**Status:** ready-for-agent

- [x] Undo button renders in the controls row above the board, ordered Notes / Undo / New Game, styled to match the other two
- [x] The button is disabled and greyed out (existing disabled-button styling) exactly when the history is empty, and enabled otherwise
- [x] Tapping it performs one undo step and the board/notes update; repeated taps step back one change at a time
- [x] At the start of a game the button is disabled; it enables after the first real change; it disables again once the history is empty
- [x] The undo result is persisted with the game
