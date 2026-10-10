# 01: Semantic token layer

**What to build:** 18 semantic CSS custom properties (`--color-*`) that map every current hardcoded color (zinc neutrals, blue accent, red mistake) to named tokens. All components and layout updated to use semantic token utilities (`bg-page`, `bg-surface`, `text-accent`, etc.) instead of hardcoded Tailwind classes. Classic + light is pixel-identical to the current app.

Additionally: remove the dead `tailwind.config.ts` (v3 format, inert under Tailwind v4) and the dead palette comment block in `sameNumberStyle.ts` (prevents unused Tailwind generation).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] 18 semantic CSS custom properties defined in a CSS `@theme` block (classic/light values match current hardcoded colors exactly)
- [ ] All 7 components + `layout.tsx` refactored to use semantic token utilities exclusively (no hardcoded zinc/blue/red classes remain)
- [ ] Dead `tailwind.config.ts` removed (dead under Tailwind v4)
- [ ] Dead palette comment block removed from `sameNumberStyle.ts`
- [ ] Classic + light renders pixel-identical to the unmodified app
