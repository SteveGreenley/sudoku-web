# 04: Page layout — landscape composition

**What to build:** the page renders the full-width header followed by a horizontal row (board on the left, right panel on the right) when in landscape mode, and the existing vertical stack when in portrait.

**Blocked by:** 01 (layout hook), 02 (Controls), 03 (NumberPad)

**Status:** resolved

- [x] When `isLandscape` is false: renders the exact existing vertical stack (Header → Controls → Board → NumberPad with Erase), pixel-for-pixel unchanged
- [x] When `isLandscape` is true: renders full-width header + a horizontal row containing:
  - Left column: the board (sized to fill available height, square)
  - Right panel: a vertical flex column with the top button row (4 buttons including Erase) above the 3×3 number grid
- [x] The board grows in landscape to fill available height (viewport height minus header and padding), capped at 432px
- [x] The board width is constrained so that `boardWidth + interPanelGap + panelWidth <= viewportWidth` (both fit horizontally)
- [x] The right panel width approximately equals the board width (panel ≈ board width, buttons fixed 72px per ticket 06)
- [x] Layout switches seamlessly on viewport resize (no flash of the wrong layout on desktop)
- [x] A brief portrait flash on landscape phone mount is acceptable (SSR renders portrait, hook measures after mount)
- [x] The Solved overlay and New Game dialog remain full-screen and centered, unchanged

## Answer

**Commits:** `f50061c` (layout), `5e73844` (perf optimization)

### Board.tsx
Added `width?: number` prop. When provided, uses inline style to set both `width` and `height` to the same value, forcing the board to be a square of that size. This overrides the CSS `w-[min(90vw,432px)]` when the landscape layout needs a custom width.

### page.tsx
- **Import**: `useLayout` from `@/hooks/useLayout`
- **Computation** (wrapped in `useMemo`): `landscapeBoardWidth` computed from viewport dimensions:
  - Height-constrained: `viewportHeight - 160` (viewport minus 80px padding, 56px header, 24px gap)
  - Width-constrained: `(viewportWidth - 48) / 2` (half of viewport minus 32px px-4 and 16px panel gap)
  - Capped at 432px, falls back to portrait if < 200px (too narrow)
- **Button sizing**: landscape buttons are fixed 72px (48×1.5, ~50% bigger than portrait), not computed from board width (ticket 06).
- **Rendering**: When `shouldShowLandscape` is true, renders a horizontal row:
  - **Left**: Board with `width={landscapeBoardWidth}` (square, height-constrained)
  - **Right**: Vertical flex column with Controls (includes `onErase` from ticket 02) + NumberPad (`layout="landscape"`, button size fixed 72px, see ticket 06)
- **Portrait fallback**: Header → Controls (no Erase in row) → Board (no width prop) → NumberPad (`layout="portrait"`). Pixel-identical to the previous single-column layout.

The layout switches on every viewport resize (handled by the `useLayout` hook's resize listener). On landscape phones, SSR renders portrait (no width known), then the hook measures on mount and switches to landscape — this brief portrait flash is acceptable per the spec.

The computation is wrapped in `useMemo` (perf commit) to avoid recomputing on every game-state render (timer, placement, etc.) — only recomputes when `isLandscape`, `viewportWidth`, or `viewportHeight` change.
