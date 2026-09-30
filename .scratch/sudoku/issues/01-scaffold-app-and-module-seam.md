# 01: Scaffold the app and module seam

**What to build:** The repo goes from docs-only to a running application shell: a client-side Next.js SPA (TypeScript, Tailwind) whose page renders a styled empty 9×9 board — cells with heavier borders around each box, plus a header — with the board rendered from the game-logic module's state through the thin React presentation layer. The module's full game state shape (difficulty, givens mask, solution, board, per-cell notes, selected cell, notes-mode flag, elapsed time, status) and its action-function seam exist from day one, even where behaviour is still minimal. The test runner is configured and the first test exercises the module seam. A user running the dev server sees the game frame, waiting for a puzzle.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Running the dev server shows a page with a 9×9 empty board, heavier borders around each box, and a header
- [ ] The board is rendered from the game-logic module's state by a presentation layer that contains no game rules
- [ ] The module exposes the full game state shape and the action-function seam (placement, notes, erase, selection), even where behaviour is minimal
- [ ] The test runner works and at least one test asserts module behaviour (state in → state out), with no test touching React components
- [ ] The page requires no network, account, or server-side logic
