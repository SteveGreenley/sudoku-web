# 07: Persistence and the new game flow

**What to build:** The game survives and can be restarted. Every change to the current game auto-saves through the module's injected storage port (implemented with localStorage in the app); reloading the page resumes the in-progress game with board, notes, difficulty, and elapsed time all intact. The New Game button starts a fresh puzzle: if the current game is in progress it asks for confirmation first, then offers the difficulty choice; the last chosen difficulty is remembered as the default. A player never loses a game to a refresh, and cannot lose one to an accidental New Game.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** ready-for-agent

- [ ] Every change to the current game is saved through the injected storage port (localStorage in the app)
- [ ] Reloading the page resumes the in-progress game with board, notes, difficulty, and elapsed time intact
- [ ] With no saved game, the page starts a fresh game
- [ ] New Game on an in-progress game asks for confirmation before discarding it
- [ ] New Game then offers the difficulty choice and starts a fresh puzzle
- [ ] The last chosen difficulty is remembered as the default
- [ ] The save/restore round-trip is tested at the module seam using an in-memory fake storage
