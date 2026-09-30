# Solution-based mistake feedback

A mistake is defined against the puzzle's solution, not against constraint checking (row/column/box duplicates). Placing a number that differs from the solution value for that cell marks the cell red, even when no visible duplicate yet exists on the board.

## Considered options

- **Constraint-based** (classic sudoku apps): red only when a number duplicates another in its row, column, or box. Rejected: it stays silent on early wrong placements, where the solution's true home for that number is still an empty cell.
- **Solution-based** (chosen): red whenever a placed number differs from the solution for that cell. Always fires; the strongest possible immediate feedback.

## Consequences

- Every game must carry its full solution (the generator emits puzzle+solution pairs); win detection is simply board-equals-solution.
- A determined player can brute-force the solution by probing 1–9 in a cell and reading the red state. Accepted: the user prioritized strong feedback over puzzle purity.
