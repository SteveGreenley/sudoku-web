# 01: Layout hook — detect viewport aspect

**What to build:** a small client hook that determines whether the viewport is in landscape (width > height). SSR renders as portrait. On the client, the hook checks `window.innerWidth > window.innerHeight` on mount and live-updates on `resize`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Hook exports `{ isLandscape: boolean, viewportWidth: number, viewportHeight: number }`
- [ ] SSR renders with `isLandscape: false` (no layout flash)
- [ ] Client measures on mount and switches if landscape detected
- [ ] Listens to `resize` for live aspect changes
- [ ] Square window (width == height) reports `isLandscape: false`
- [ ] No SSR/CSR hydration mismatch warnings in the console
