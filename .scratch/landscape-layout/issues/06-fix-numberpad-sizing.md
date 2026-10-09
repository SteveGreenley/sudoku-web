# 06: Fix number pad sizing and layout gaps

**What to build:** fix portrait mode number buttons to be their original 48px, fix landscape mode number buttons to be ~50% bigger than portrait (~72px), and add spacing between the board and number grid in landscape mode.

**Blocked by:** 04 (page layout), 02 (Controls), 03 (NumberPad)

**Status:** ready-for-agent

- [ ] Portrait mode: number buttons are 48px (h-12 w-12) — matching their size before landscape mode was introduced
- [ ] Landscape mode: number buttons are ~72px (48px × 1.5, ~50% bigger than portrait)
- [ ] Landscape mode: spacing (gap) between the board and the number grid / Controls panel
- [ ] All 164 unit tests still pass
- [ ] Lint still passes (0 errors, 4 pre-existing warnings unchanged)
- [ ] NumberPad component: portrait mode buttons restored to `h-12 w-12` (no `buttonSize` prop needed for portrait)
- [ ] NumberPad component: landscape mode uses fixed 72px button size (no longer computed from board width)
- [ ] page.tsx: no longer computes `landscapeButtonSize` from board width — just passes a fixed 72

## Acceptance criteria

- [ ] In portrait mode (any viewport), number buttons are 48px wide and 48px tall (same as before landscape mode)
- [ ] In landscape mode, number buttons are 72px wide and 72px tall (50% bigger than portrait)
- [ ] In landscape mode, there is visible horizontal spacing (at least gap-2 / 16px) between the board and the right panel (Controls + NumberPad)
- [ ] Layout looks correct on all 4 viewports: 375×812, 812×375, 1440×900, 500×800
- [ ] `npm test` passes (all 164 unit tests green)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npx tsc --noEmit` passes (no type errors)

## Further notes

The key files to change:
- `src/components/NumberPad.tsx` — restore `h-12 w-12` on number buttons for portrait mode; change landscape to use a fixed ~72px button size instead of computing from board width
- `src/app/page.tsx` — remove `landscapeButtonSize` computation; pass a fixed 72 to NumberPad for landscape; add `gap-4` between board and panel divs in the landscape outer flex

The game-logic module (`src/game/`) is not touched.
