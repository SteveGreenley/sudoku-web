# 05: Verification — viewports, lint, unit tests

**What to build:** verify the landscape layout renders correctly at all target viewports, the existing 164 unit tests still pass, and lint is clean.

**Blocked by:** 04 (page layout)

**Status:** ready-for-agent

- [ ] Layout verified at 4 viewports via Playwright (phone portrait 375×812, phone landscape 812×375, wide desktop 1440×900, portrait desktop window 500×800):
  - Portrait viewports: board ≤ 432px, number pad in horizontal row with Erase
  - Landscape viewports: board visibly larger than portrait, number pad in 3×3 grid, top button row with 4 buttons (Notes, Undo, New Game, Erase)
- [ ] `npm test` passes (all 164 unit tests green)
- [ ] `npm run lint` passes (0 errors, 4 pre-existing warnings unchanged — see `test-results-ui.md`)
- [ ] `npx tsc --noEmit` passes (no type errors)
