# 01: Layout hook — detect viewport aspect

**What to build:** a small client hook that determines whether the viewport is in landscape (width > height). SSR renders as portrait. On the client, the hook checks `window.innerWidth > window.innerHeight` on mount and live-updates on `resize`.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Hook exports `{ isLandscape: boolean, viewportWidth: number, viewportHeight: number }`
- [x] SSR renders with `isLandscape: false` (no layout flash)
- [x] Client measures on mount and switches if landscape detected
- [x] Listens to `resize` for live aspect changes
- [x] Square window (width == height) reports `isLandscape: false`
- [x] No SSR/CSR hydration mismatch warnings in the console

## Answer

**Commit:** `fdf22e1`

`src/hooks/useLayout.ts` implements the hook using React's `useState`, `useCallback`, and `useEffect`. SSR renders `{ isLandscape: false, viewportWidth: 0, viewportHeight: 0 }` — no flash. On mount the client measures `window.innerWidth` / `window.innerHeight` and updates state if landscape. A passive `resize` listener keeps it live. The spec says a brief portrait flash on landscape phones is acceptable for v1; this hook makes that happen without inline scripts or SSR hydration trickery.
