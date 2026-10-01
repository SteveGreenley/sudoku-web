# 07: Persistence and the new game flow

**What to build:** The game survives and can be restarted. Every change to the current game auto-saves through the module's injected storage port (implemented with localStorage in the app); reloading the page resumes the in-progress game with board, notes, difficulty, and elapsed time all intact. The New Game button starts a fresh puzzle: if the current game is in progress it asks for confirmation first, then offers the difficulty choice; the last chosen difficulty is remembered as the default. A player never loses a game to a refresh, and cannot lose one to an accidental New Game.

**Blocked by:** 03 (Selection, placement, and mistake feedback)

**Status:** done

- [x] Every change to the current game is saved through the injected storage port (localStorage in the app)
- [x] Reloading the page resumes the in-progress game with board, notes, difficulty, and elapsed time intact
- [x] With no saved game, the page starts a fresh game
- [x] New Game on an in-progress game asks for confirmation before discarding it
- [x] New Game then offers the difficulty choice and starts a fresh puzzle
- [x] The last chosen difficulty is remembered as the default
- [x] The save/restore round-trip is tested at the module seam using an in-memory fake storage

## Comments

- 2026-10-01: Implemented. Added `StoragePort` interface (`get`/`set`) to game module. Pure `saveState(state, storage)` serializes GameState to storage; `loadState(storage)` deserializes (returns null when no data or corrupted); `discardState(storage)` clears. `saveLastDifficulty`/`getLastDifficulty` persist the last chosen difficulty. App layer uses `localStoragePort` (wraps `localStorage.getItem`/`setItem`). Every game change (place, toggleNote, erase, keyboard input, pad input) saves to localStorage. On mount: tries to load saved playing game, or starts fresh with last difficulty (defaults to "easy"). New Game button opens `NewGameDialog`: confirmation step, then difficulty picker, then starts fresh game (discards old, saves last difficulty). `SolvedOverlay` also triggers New Game flow (discards, starts fresh). 42 tests pass (7 new persistence tests). Lint clean.
