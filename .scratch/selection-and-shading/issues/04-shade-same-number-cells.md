# 04: Shade the same-number cells — darker on the selected, lighter on the others

**What to build:** The `shade` branch of the same-number appearance switch (ticket 03): every cell holding the same number as the selected filled cell gets a background shade of one shading color. The selected filled cell itself gets the darker version of the shade; the other same-number instances get the lighter version. Flipping the 03 switch to `shade` is the entire change for this ticket.

**Blocked by:** 03 (Swappable same-number appearance)

**Status:** ready-for-agent

- [ ] With the switch on `shade` and a filled cell selected: the selected cell is filled with the dark variant of the shade (replacing the current blue selection fill), and every other cell holding the same number — givens and placed alike, mistaken or not — is filled with the light variant.
- [ ] Where both apply (a same-number instance also in the selected cell's row, column, or box), the light shade wins over the row/column/box fill; elsewhere the existing fills are untouched (white/hover, row/column/box fill, blue selection fill on a non-filled selected cell).
- [ ] Digits stay legible on both variants: the text color is chosen deliberately per variant; a mistaken cell of the same number keeps its red text over the shade; given cells stay visually readable as givens.
- [ ] Same-number note instances in empty cells keep their current bold, unchanged — no shade on notes-only cells.
- [ ] When the selected cell holds no number (incompleted, notes-only or empty), no shade appears at all, as today.
- [ ] While in cell selection, the shade — like all single-cell highlighting — is suppressed.
- [ ] The shade for this ticket is a single accent color with a dark + light variant, defined in the 03 style module (the per-value palette arrives in 05); unit tests at the module seam verify the dark/light assignment and the switch's two values.
