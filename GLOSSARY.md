# Sudoku

A browser game for playing a single sudoku puzzle, with pencil notes and immediate feedback on incorrect placements.

## Language

### The board

**Board**:
The 9x9 grid of cells.

**Cell**:
A single square on the board.

**Box**:
The 3x3 sub-grid a cell belongs to; the unit used for highlighting.
_Avoid_: Block (that is the whole board), region, square

**Given**:
A cell pre-filled by the puzzle; selectable but never editable.
_Avoid_: Clue, hint, seed

### Values and feedback

**Solution**:
The complete grid the puzzle resolves to; the authoritative reference for mistakes and winning.

**Mistake**:
Placing a number in a cell that does not match the puzzle's solution for that cell.
_Avoid_: Conflict, violation (constraint checking is not used for feedback)

**Note**:
A free pencil annotation of a possible value on an empty cell; never validated against the solution.
_Avoid_: Pencil mark, candidate

### Selection

**Incompleted**:
A cell with no placed number, including notes-only cells; givens and cells holding a number are completed.
_Avoid_: Empty, blank

**Cell selection**:
A mode entered by dragging across incompleted cells, in which a set of incompleted cells is selected for batch note editing; distinct from single-cell selection.
_Avoid_: Multi-select, range

**Primary**:
The last-touched cell in a selection — the cell `selected` points to.
_Avoid_: Active, current
