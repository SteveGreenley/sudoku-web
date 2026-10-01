# 01: Disable NumberPad buttons when all 9 instances of a number are placed

**What to build:** When a player has placed (or given) all 9 instances of a number 1–9 on the board, the corresponding NumberPad button becomes non-interactive and visually faded (opacity-40, cursor-not-allowed). Keyboard input for that number is also silently ignored — no placement happens, no error shown.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Pure function `getDisabledNumbers(state: GameState): Set<number>` added to `highlights.ts` that counts how many of each number appear on the board (including given cells) and returns numbers whose count has reached 9
- [x] `NumberPad` receives a `disabledNumbers` prop and buttons for numbers in that set do not fire any action when clicked
- [x] Disabled buttons render with `opacity-40` and `cursor-not-allowed`, keeping the same shape and color as enabled buttons
- [x] Keyboard input (keys 1–9) for a complete number is silently ignored in `place()` — no placement, no visual feedback
- [x] All acceptance criteria verified end-to-end (disabled state works via mouse, keyboard, and notes mode remains unaffected)
