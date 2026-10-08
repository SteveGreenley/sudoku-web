# 02: Verify disabled numbers works in UI

**What to build:** When a player has placed (or given) all 9 instances of a number 1–9 on the board, the corresponding NumberPad button should become non-interactive (visually faded with opacity-40, cursor-not-allowed). Keyboard input for that number should also be silently ignored.

The unit tests pass (`getDisabledNumbers` returns the correct Set of disabled numbers, and `place()` and `toggleNote()` respect the disabled state). However, this feature was not fully tested in the UI.

**Steps to reproduce:**
1. Start a new game (Easy)
2. Place 9 instances of a number (e.g., number 5)
3. Observe: the corresponding NumberPad button (number 5) should be disabled (opacity-40, cursor-not-allowed)
4. Click the disabled button: should do nothing
5. Type the number on the keyboard: should be silently ignored

**Acceptance criteria:**
- [x] All 9 instances of a number are placed on the board
- [x] The corresponding NumberPad button shows visual feedback (opacity-40, cursor-not-allowed)
- [x] Clicking the disabled button does nothing (no placement)
- [x] Keyboard input for disabled number is silently ignored (no placement, no error)
- [x] Notes mode is unaffected (can still add/remove notes for other numbers)

**Implementation notes:**
- `getDisabledNumbers(state)` counts each number 1–9 on the board (including givens) and returns a Set of numbers whose count reaches 9
- `NumberPad` receives a `disabledNumbers` prop: disabled buttons render with `opacity-40` and `cursor-not-allowed`
- `place()` and `toggleNote()` ignore keys 1–9 when the number is in `disabledNumbers`

## Status: done

## Comments

- 2026-10-08: UI verified. Filled 9 instances of number 5 on a new game (3 given + 6 placed). NumberPad button 5 renders as `opacity-40, cursor-not-allowed` with `disabled` HTML attribute. Clicking disabled button is blocked by the browser. Typing 5 on empty cells is silently ignored — R2C4 remains empty. Notes mode guard (`toggleNote` checks `disabled.has(value)`) only blocks disabled numbers, leaving 1-4, 6-9 fully functional.

