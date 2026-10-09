# 06: Fix number pad sizing and layout gaps

**What to build:** fix portrait mode number buttons to be their original 48px, fix landscape mode number buttons to be ~50% bigger than portrait (~72px), and add spacing between the board and number grid in landscape mode.

**Blocked by:** 04 (page layout), 02 (Controls), 03 (NumberPad)

**Status:** resolved

- [x] Portrait mode: number buttons are 48px (h-12 w-12) — matching their size before landscape mode was introduced
- [x] Landscape mode: number buttons are ~72px (48px × 1.5, ~50% bigger than portrait)
- [x] Landscape mode: spacing (gap) between the board and the number grid / Controls panel
- [x] All 164 unit tests still pass
- [x ] Lint still passes (0 errors, 4 pre-existing warnings unchanged)
- [x] NumberPad component: portrait mode buttons restored to `h-12 w-12` (no `buttonSize` prop needed for portrait)
- [x ] NumberPad component: landscape mode uses fixed 72px button size (no longer computed from board width)
- [x ] page.tsx: no longer computes `landscapeButtonSize` from board width — just passes a fixed 72

## Acceptance criteria

- [x] In portrait mode (any viewport), number buttons are 48px wide and 48px tall (same as before landscape mode)
- [x] In landscape mode, number buttons are 72px wide and 72px tall (50% bigger than portrait)
- [x] In landscape mode, there is visible horizontal spacing (gap-4 / 16px) between the board and the right panel (Controls + NumberPad)
- [x ] Layout looks correct on all 4 viewports: 375×812, 812×375, 1440×900, 500×800
- [x ] `npm test` passes (all 164 unit tests green)
- [x ] `npm run lint` passes (0 errors)
- [x ] `npx tsc --noEmit` passes (no type errors)

## Further notes

The fix changes:
- `src/components/NumberPad.tsx` — portrait mode buttons restored to `h-12 w-12` (48px), landscape buttons use fixed 72px instead of computed from board width
- `src/app/page.tsx` — removed `landscapeButtonSize` from useMemo; passes fixed 72 to NumberPad for landscape; added `gap-4` between board and panel divs in the landscape outer flex

The game-logic module (`src/game/`) is not touched.
