# 02: Controls — landscape mode (optional Erase)

**What to build:** the Controls component extended to render the Erase button in its top button row when in landscape mode.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Controls accepts optional `onErase?: () => void` prop
- [x] When `onErase` is provided, the top button row renders 4 buttons: Notes, Undo, New Game, Erase (in that order)
- [x] When `onErase` is not provided, Controls renders exactly as it does today (Notes, Undo, New Game only)
- [x] The 4-button row fits on one line at all reasonable widths (no wrapping)
- [x] Portrait mode rendering is unchanged

## Answer

**Commit:** `7c776c5`

`src/components/Controls.tsx` — added `onErase?: () => void` to `ControlsProps` and destructured it from props. When `onErase` is provided, renders an erase button (⌫) after New Game as the 4th item in the row. When not provided (current page usage), renders the existing 3-button row exactly as before — portrait mode is completely unchanged.

The 4-button row width is well within 432px (each button is ~30–40px wide plus padding, total ~150px with gaps, fits on one line at any reasonable viewport width).
