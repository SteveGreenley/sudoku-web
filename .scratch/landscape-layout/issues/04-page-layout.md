# 04: Page layout — landscape composition

**What to build:** the page renders the full-width header followed by a horizontal row (board on the left, right panel on the right) when in landscape mode, and the existing vertical stack when in portrait.

**Blocked by:** 01 (layout hook), 02 (Controls), 03 (NumberPad)

**Status:** ready-for-agent

- [ ] When `isLandscape` is false: renders the exact existing vertical stack (Header → Controls → Board → NumberPad with Erase), pixel-for-pixel unchanged
- [ ] When `isLandscape` is true: renders full-width header + a horizontal row containing:
  - Left column: the board (sized to fill available height, square)
  - Right panel: a vertical flex column with the top button row (4 buttons including Erase) above the 3×3 number grid
- [ ] The board grows in landscape to fill available height (viewport height minus header and padding), capped at 432px
- [ ] The board width is constrained so that `boardWidth + interPanelGap + panelWidth <= viewportWidth` (both fit horizontally)
- [ ] The right panel width approximately equals the board width (panel ≈ board width, buttons ≈ board width / 3)
- [ ] Layout switches seamlessly on viewport resize (no flash of the wrong layout on desktop)
- [ ] A brief portrait flash on landscape phone mount is acceptable (SSR renders portrait, hook measures after mount)
- [ ] The Solved overlay and New Game dialog remain full-screen and centered, unchanged
