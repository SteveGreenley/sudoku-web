# Spec: Landscape Layout

Status: 6/6 tickets resolved

## Problem Statement

On a wide screen (phone rotated landscape, or any viewport whose width exceeds its height), the current portrait layout wastes space. The board is capped at 432px wide and stacked above a single horizontal row of 10 buttons (numbers 1–9 + Erase). The user sees a compact board floating in a large viewport, with controls crammed into a thin strip. The experience is comfortable on a phone held portrait but wasteful when rotated.

## Solution

When the viewport width exceeds its height, the app switches to a side-by-side layout: the board stays on the left, and a right panel occupies the remaining horizontal space. The right panel has two zones — a top button row (Notes toggle, Undo, New Game, Erase) and below it a 3×3 number grid whose buttons are fixed 72px (48px × 1.5, ~50% bigger than the 48px portrait buttons). The board grows to fill available vertical space (capped so board + panel always fit the width).

The spec-trigger is a client-side hook observing `window.innerWidth > window.innerHeight` — a live viewport aspect, not the CSS `orientation` media query. A square window (width == height) remains portrait.

## User Stories

1. As a player on a phone who rotates it to landscape, I want the board and controls rearranged side-by-side so that the board gets larger and the controls are still accessible without reaching far.
2. As a player on a wide desktop monitor, I want the number pad beside the board (not below it) so that the game fills the screen more usefully.
3. As a player, I want the board to grow in landscape (constrained by available height) so that the numbers on the grid are easier to read.
4. As a player, I want the number pad arranged as a 3×3 grid in landscape so that each button is large and easy to tap.
5. As a player, I want the number pad buttons in landscape to be about 50% bigger than portrait (fixed 72px), so the right panel balances the board without being excessive.
6. As a player, I want the Erase button to move into a top button row (alongside Notes, Undo, New Game) in landscape, so that the 3×3 number grid contains only 1–9 and the row of utility buttons is easy to reach.
7. As a player, I want the top button row to appear above the 3×3 number grid in landscape, so that utility buttons (notes toggle, undo, new game, erase) are grouped at the top of the right panel.
8. As a player, I want the header (title, difficulty, timer) to remain full-width across the top in landscape, so that game info is always at the top of the screen regardless of layout.
9. As a player, I want the layout to switch seamlessly when I rotate my device, so that I never lose my place in the game.
10. As a player in portrait, I want the layout to stay exactly as it is today (stacked vertical), so that rotating back to portrait restores the familiar experience.
11. As a player, I want all keyboard and pointer behavior to be unchanged by the layout switch, so that this is purely a visual/layout change.
12. As a player, I want the Solved overlay and New Game dialog to remain full-screen and centered regardless of orientation, so that they are always accessible and visible.
13. As a player who rotates a phone into a narrow portrait window (e.g. on desktop), I want the portrait (stacked) layout to be used, so that the layout matches the available space.
14. As a player with a square viewport (width equals height), I want the portrait layout, so that the layout does not switch when the aspect is ambiguous.
15. As a player, I want the game state (board, notes, timer, history) to be completely unaffected by the layout change, so that switching orientations does not alter the puzzle.

## Implementation Decisions

- **Layout trigger**: a small client-side hook (`useLayout`) that returns `{ isLandscape, orientation }` based on `window.innerWidth > window.innerHeight`. On SSR renders portrait (`isLandscape: false`). The hook listens to `resize` for live updates. This is a *viewport aspect* check, not the CSS `orientation` media query — a portrait-shaped window on a landscape monitor uses the portrait layout, and a square window uses the portrait layout.

- **Layout modes**:
  - **Portrait** (default, or when `innerWidth <= innerHeight`): the existing full-width vertical stack: `<Header />` → `<Controls />` (Notes, Undo, New Game) → `<Board />` → `<NumberPad />` (9 numbers + Erase in one horizontal row, width `min(90vw, 432px)`).
  - **Landscape** (when `innerWidth > innerHeight`): a horizontal `<main>` row containing:
    - **Left column**: `<Header />` (full-width top bar, outside the row) → `<Board />` (sized to fill available height, capped by width so board + panel fit).
    - **Right panel**: a vertical flex column of width approximately equal to the board width, containing:
      - **Top button row**: `<Controls />` (Notes, Undo, New Game) plus the **Erase** button appended at the end. This replaces the current `<Controls />` (which has no Erase) with an extended variant.
      - **Number grid**: `<NumberPad />` rendered as a 3×3 grid (9 buttons, no Erase). Each landscape button is fixed 72px (48px × 1.5, ~50% bigger than portrait).

- **Board sizing in landscape**: the board height is computed as `availableHeight - headerHeight - gap` (where `availableHeight` is the viewport height minus outer padding), capped at 432px in portrait, but in landscape the cap is raised so the board fills the vertical space. The board width is `availableHeight` (it stays square), then the board width is further constrained so `boardWidth + interPanelGap + panelWidth <= viewportWidth`. The board is always `width: height` (aspect-square) as it currently is.

- **NumberPad component**: receives a layout prop (`'portrait' | 'landscape'`) that changes its rendering:
  - `portrait`: current behavior — horizontal row of 9 numbers + Erase button, buttons `h-12 w-12` (48×48px), container width `min(90vw, 432px)`.
  - `landscape`: grid rendering — 3×3 layout (just 9 buttons, no Erase), each button fixed 72px.

- **Controls component**: extended to accept an optional `onErase` prop (in landscape) so it can render the Erase button in the top row. The Notes toggle behavior is unchanged.

- **No game-logic changes**: the pure game module (`src/game/index.ts`) is untouched. Layout is entirely a presentation concern.

- **No flash on mount**: SSR renders portrait (the default). On mount, the hook measures the viewport and if landscape is detected, the layout switches immediately (a brief flash of portrait may occur on landscape phones; acceptable for v1, no inline script or SSR hydration trickery).

- **Out of scope**: dark mode, RTL languages, custom device-width heuristics, CSS-only responsive implementation (a JS hook is needed because the trigger is *viewport aspect*, not a breakpoint or screen orientation).

## Testing Decisions

- **What a good test is**: verify the layout renders correctly at four viewport widths/heights — phone portrait (375×812), phone landscape (812×375), wide desktop (1440×900), and portrait desktop window (500×800). The board in landscape should be visibly larger than in portrait; the number pad in landscape should be a 3×3 grid with the top button row containing 4 buttons (Notes, Undo, New Game, Erase); the portrait layout should remain unchanged.

- **Modules tested**: layout rendering only — page.tsx (the layout composition), NumberPad.tsx (portrait vs. landscape rendering), Controls.tsx (extended top row with Erase). The pure game-logic module remains unchanged and tested as before.

- **Prior art**: the repo uses Playwright (via browser MCP) for UI verification (see `test-results-ui.md`). The game-logic module has 164 passing unit tests (vitest); those tests should continue to pass unchanged. A full run of `npm test && npm lint && npx tsc` should remain green.

## Out of Scope

- CSS-only responsive implementation (the trigger is viewport aspect, not a breakpoint)
- Dark mode or theming beyond the existing single theme
- Custom screen-width heuristics (always use viewport aspect)
- Layout changes to the Solved overlay or New Game dialog (both stay full-screen and centered)
- Any changes to keyboard navigation, pointer/gesture handling, or game-logic behavior
- Accessibility audit beyond what the current layout already provides (landmarks, ARIA labels, and keybinds remain unchanged)

## Further Notes

- The root `SPEC.md` Layout section already says *"Number pad: beside the board on desktop, below on mobile"* — this spec refines that statement by specifying the *landscape* layout (3×3 grid with Erase in the top row) as the trigger for "beside the board on desktop" rather than a separate desktop breakpoint.

- The repo convention is `.scratch/<feature-slug>/spec.md` and a `Status:` line near the top. The `ready-for-agent` triage label applies (see `docs/agents/triage-labels.md`).

- The existing 164 unit tests in `game/index.test.ts`, `game/selection.test.ts`, `game/highlights.test.ts`, and `components/sameNumberStyle.test.ts` should pass without modification — no game-logic is touched.

- Implementation commits:
  - 01 (layout hook): `fdf22e1`
  - 02 (Controls onErase): `7c776c5`
  - 03 (NumberPad 3x3): `cec5bc8` (portrait fixed 48px, landscape 72px fixed)
  - 04 (page layout): `f50061c`
  - 04 perf (useMemo): `5e73844`
  - 06 (fix sizing + gaps): (this commit)
