# 01: Same-number shade not rendering on board

**What to investigate:** When a cell with a value (e.g., "3") is selected, the same-number cells should get a background shade (amber for value 3, lime for value 5, etc.). However, the cells still show `bg-blue-300` (blue selection fill) instead of the amber shade.

The unit tests pass (palette colors are correctly returned by `sameNumberStyle`), but the UI shows no shade. The selected cell has `bg-blue-300` and other same-number cells have `bg-white` (no shade).

**Steps to reproduce:**
1. Start a new game (Easy)
2. Click on a cell with value "3" (e.g., cell 40, Row 5, column 5)
3. Observe: selected cell has `bg-blue-300`, other cells with "3" have `bg-white`
4. Expected: selected cell should have amber shade (e.g., `#fcd34d`), other cells with "3" should have light amber shade (e.g., `#fef3c7`)

**Acceptance criteria:**
- [ ] Selecting a cell with value "3" applies amber shade (dark variant) to the selected cell
- [ ] Selecting a cell with value "3" applies light amber shade to other cells with "3"
- [ ] Different values get different shade colors (value 5 = lime, value 9 = violet, etc.)
- [ ] The shade replaces the blue selection fill for the selected cell
- [ ] The shade wins over the row/column/box fill (blue-100) for other same-number cells

**Possible causes:**
- The `sameNumber.background` is not being passed to the Cell component correctly
- The Cell component is not using the inline styles correctly
- The palette colors are being computed but not rendered

## Comments

