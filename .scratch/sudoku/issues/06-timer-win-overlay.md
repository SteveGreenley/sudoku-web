# 06: Timer, winning, and the solved overlay

**What to build:** The game tracks time and ends. An elapsed-time timer in the header starts on the player's first input (not when the puzzle appears) and runs until the game is won. The game is solved exactly when every cell holds a number and the board equals the solution — any mistake on the board prevents winning. On solving, a "solved" overlay appears with the elapsed time and a New Game button, and the game's status flips to solved. A player who completes the board correctly experiences a clear win moment.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** done

- [x] A timer in the header shows elapsed time, starting on the player's first input
- [x] Elapsed time accumulates in the game state so it survives reload
- [x] The game flips to solved exactly when the board is complete and equals the solution
- [x] A board containing any mistake does not win
- [x] A "solved" overlay shows the elapsed time and a New Game button
- [x] Win detection is tested at the module seam (complete-and-correct wins; complete-with-a-mistake does not)

## Comments

- 2026-10-01: Implemented. Added `startTime` to `GameState`. Pure `startGameTimer(state)` sets `startTime` on first input, then `elapsedMs` computed via interval in `page.tsx` as `Date.now() - startTime`. Timer starts only on first place/toggleNote/erase. Pure `checkWin(state)` sets status to "solved" when board fully matches solution. `SolvedOverlay` component renders on solved status: centered modal with elapsed time (formatted as mm:ss), difficulty, and 4 difficulty buttons for New Game. Header already showed `elapsedMs` (now updating via interval). 35 tests pass (8 new: startGameTimer, checkWin). Lint clean.
