# 02: Puzzle generation and new game

**What to build:** Loading the game presents a difficulty choice (Easy / Medium / Hard / Expert) and starts a game with a freshly generated puzzle. Generation builds a complete valid grid, removes cells according to a per-difficulty budget (Easy removes the fewest, Expert the most), and verifies the result has exactly one solution, removing fewer cells or regenerating when it does not. Givens render pre-filled and visually distinct from cells the player can change. A player arriving at the page sees a valid, unique-solution puzzle and can tell what is fixed.

**Blocked by:** 01 (Scaffold the app and module seam)

**Status:** done

- [x] Starting the game produces a complete valid grid with a per-difficulty removal budget (Easy removes the fewest cells, Expert the most)
- [x] Every generated puzzle has exactly one solution (generation counts solutions up to two and backs off or regenerates if more)
- [x] The page presents the difficulty choice and renders the puzzle's givens pre-filled and visually distinct from empty cells
- [x] A freshly generated game carries its full solution in state (per ADR 0001, the reference for all mistake feedback)
- [x] Generation is tested at the module seam: validity, removal budget per difficulty, uniqueness

## Comments

- 2026-10-01: Implemented. `src/game/generator.ts` builds a complete valid grid (backtracking with a seeded-RNG shuffle), then removes cells in random order against a per-difficulty budget (Easy 43 / Medium 48 / Hard 53 / Expert 57 removals) — each removal is kept only while `countSolutions` (MRV backtracking, capped at two) reports exactly one. `startGame(difficulty)` seeds the full state: givens mask, full solution (per ADR 0001), board pre-filled with the givens. The page shows a difficulty picker and starts a game on load (client-side generation via effect callback to keep SSR deterministic); givens render bold/dark against editable blue values. Seam tests: 24 passing (validity, budget monotonicity and caps, uniqueness, determinism, startGame). Dev server render and static production build verified.
