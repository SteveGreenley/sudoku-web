# 03: NumberPad — landscape mode (3×3 grid)

**What to build:** the NumberPad component extended to render the 9 numbers in a responsive 3×3 grid when in landscape mode.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] NumberPad accepts `layout: 'portrait' | 'landscape'` prop (default `'portrait'`)
- [x] When `layout === 'portrait'`, NumberPad renders exactly as it does today (horizontal row of 9 numbers + Erase button)
- [x] When `layout === 'landscape'`, NumberPad renders 9 numbers in a responsive 3×3 grid (no Erase button)
- [x] Each landscape button is sized so that 3 buttons + gaps ≈ the provided `buttonSize` (width)
- [x] Buttons in landscape retain the same disabled-state styling (opacity) as portrait
- [x] NumberPad receives a `buttonSize: number` prop for landscape sizing

## Answer

**Commit:** `cec5bc8`

`src/components/NumberPad.tsx` accepts `layout: 'portrait' | 'landscape'` and optional `buttonSize: number`.

**Portrait mode:** renders exactly as before — 9 numbers + Erase button in a horizontal row, fixed 48px buttons.

**Landscape mode:** renders 9 numbers in a 3×3 CSS grid (no Erase button — that's handled by the top row from ticket 02). Each button gets an inline `width` + `aspectRatio: 1` to stay square. Disabled-state styling (opacity) is identical to portrait.

`src/app/page.tsx` updated to pass `layout="portrait"` to the existing NumberPad usage — no behavior change for portrait.
