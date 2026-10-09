# 02: Controls — landscape mode (optional Erase)

**What to build:** the Controls component extended to render the Erase button in its top button row when in landscape mode.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Controls accepts optional `onErase?: () => void` prop
- [ ] When `onErase` is provided, the top button row renders 4 buttons: Notes, Undo, New Game, Erase (in that order)
- [ ] When `onErase` is not provided, Controls renders exactly as it does today (Notes, Undo, New Game only)
- [ ] The 4-button row fits on one line at all reasonable widths (no wrapping)
- [ ] Portrait mode rendering is unchanged
