# 03: NumberPad — landscape mode (3×3 grid)

**What to build:** the NumberPad component extended to render the 9 numbers in a responsive 3×3 grid when in landscape mode.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] NumberPad accepts `layout: 'portrait' | 'landscape'` prop (default `'portrait'`)
- [ ] When `layout === 'portrait'`, NumberPad renders exactly as it does today (horizontal row of 9 numbers + Erase button)
- [ ] When `layout === 'landscape'`, NumberPad renders 9 numbers in a responsive 3×3 grid (no Erase button)
- [ ] Each landscape button is sized so that 3 buttons + gaps ≈ the provided `buttonSize` (width)
- [ ] Buttons in landscape retain the same disabled-state styling (opacity) as portrait
- [ ] NumberPad receives a `buttonSize: number` prop for landscape sizing
