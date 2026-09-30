# 06: Timer, winning, and the solved overlay

**What to build:** The game tracks time and ends. An elapsed-time timer in the header starts on the player's first input (not when the puzzle appears) and runs until the game is won. The game is solved exactly when every cell holds a number and the board equals the solution — any mistake on the board prevents winning. On solving, a "solved" overlay appears with the elapsed time and a New Game button, and the game's status flips to solved. A player who completes the board correctly experiences a clear win moment.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** ready-for-agent

- [ ] A timer in the header shows elapsed time, starting on the player's first input
- [ ] Elapsed time accumulates in the game state so it survives reload
- [ ] The game flips to solved exactly when the board is complete and equals the solution
- [ ] A board containing any mistake does not win
- [ ] A "solved" overlay shows the elapsed time and a New Game button
- [ ] Win detection is tested at the module seam (complete-and-correct wins; complete-with-a-mistake does not)
