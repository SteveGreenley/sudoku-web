# 05: Verification — viewports, lint, unit tests

**What to build:** verify the landscape layout renders correctly at all target viewports, the existing 164 unit tests still pass, and lint is clean.

**Blocked by:** 04 (page layout)

**Status:** resolved

- [x] Layout verified at 4 viewports via Playwright (phone portrait 375×812, phone landscape 812×375, wide desktop 1440×900, portrait desktop window 500×800):
  - Portrait viewports: board ≤ 432px, number pad in horizontal row with Erase
  - Landscape viewports: board visibly larger than portrait, number pad in 3×3 grid, top button row with 4 buttons (Notes, Undo, New Game, Erase)
- [x] `npm test` passes (all 164 unit tests green)
- [x] `npm run lint` passes (0 errors, 4 pre-existing warnings unchanged — see `test-results-ui.md`)
- [x] `npx tsc --noEmit` passes (no type errors)

## Answer

**Commit:** (this commit)

### Viewport verification (Playwright)

| Viewport | Detection | Result |
|---|---|---|
| 375×812 (phone portrait) | 375>812=false | Portrait layout: 3 controls + 81-cell board + 9 nums + Erase |
| 812×375 (phone landscape) | 812>375=true | Landscape layout: 4 controls (Notes, Undo, New Game, **Erase**) + board + 9 nums (no Erase in grid) |
| 1440×900 (wide desktop) | 1440>900=true | Landscape layout: board visibly larger (height-constrained, 432px cap) |
| 500×800 (portrait desktop window) | 500>800=false | Portrait layout: identical to phone portrait |

Key landscape observations:
- Top button row contains 4 buttons: Notes, Undo, New Game, **Erase (⌫)**
- Number pad in landscape mode renders 9 numbers in a 3×3 grid (no Erase button — it moved to the top row)
- Board on the left is square and sized to fill available height (capped at 432px)
- Number pad buttons sized to ≈ board width / 3

### Standard checks

- **TypeScript**: `npx tsc --noEmit` passes (0 errors)
- **ESLint**: 0 errors, 4 pre-existing warnings unchanged
- **Unit tests**: 164/164 pass (game-logic module unchanged)
