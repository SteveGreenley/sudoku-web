# 02: Puzzle generation and new game

**What to build:** Loading the game presents a difficulty choice (Easy / Medium / Hard / Expert) and starts a game with a freshly generated puzzle. Generation builds a complete valid grid, removes cells according to a per-difficulty budget (Easy removes the fewest, Expert the most), and verifies the result has exactly one solution, removing fewer cells or regenerating when it does not. Givens render pre-filled and visually distinct from cells the player can change. A player arriving at the page sees a valid, unique-solution puzzle and can tell what is fixed.

**Blocked by:** 01 (Scaffold the app and module seam)

**Status:** ready-for-agent

- [ ] Starting the game produces a complete valid grid with a per-difficulty removal budget (Easy removes the fewest cells, Expert the most)
- [ ] Every generated puzzle has exactly one solution (generation counts solutions up to two and backs off or regenerates if more)
- [ ] The page presents the difficulty choice and renders the puzzle's givens pre-filled and visually distinct from empty cells
- [ ] A freshly generated game carries its full solution in state (per ADR 0001, the reference for all mistake feedback)
- [ ] Generation is tested at the module seam: validity, removal budget per difficulty, uniqueness
