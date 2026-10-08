# 04: Shade the same-number cells — darker on the selected, lighter on the others

**What to build:** The `shade` branch of the same-number appearance switch (ticket 03): every cell holding the same number as the selected filled cell gets a background shade of one shading color. The selected filled cell itself gets the darker version of the shade; the other same-number instances get the lighter version. Flipping the 03 switch to `shade` is the entire change for this ticket.

**Blocked by:** 03 (Swappable same-number appearance)

**Status:** done

- [x] With the switch on `shade` and a filled cell selected: the selected cell is filled with the dark variant of the shade (replacing the current blue selection fill), and every other cell holding the same number — givens and placed alike, mistaken or not — is filled with the light variant.
- [x] Where both apply (a same-number instance also in the selected cell's row, column, or box), the light shade wins over the row/column/box fill; elsewhere the existing fills are untouched (white/hover, row/column/box fill, blue selection fill on a non-filled selected cell).
- [x] Digits stay legible on both variants: the text color is chosen deliberately per variant; a mistaken cell of the same number keeps its red text over the shade; given cells stay visually readable as givens.
- [x] Same-number note instances in empty cells keep their current bold, unchanged — no shade on notes-only cells.
- [x] When the selected cell holds no number (incompleted, notes-only or empty), no shade appears at all, as today.
- [x] While in cell selection, the shade — like all single-cell highlighting — is suppressed.
- [x] The shade for this ticket is a single accent color with a dark + light variant, defined in the 03 style module (the per-value palette arrives in 05); unit tests at the module seam verify the dark/light assignment and the switch's two values.

## Comments

- 2026-10-08: Implemented on `selection-and-shading`. `sameNumberStyle.ts` shade branch now returns a single amber accent: dark `bg-amber-300`/`text-amber-900` on the selected in-set cell, light `bg-amber-100`/`text-amber-700` on other instances, all-null outside the set. Added a `textColor` slot (null in bold); `Cell` composes `isMistake → text-red-500` first, else `sameNumber.textColor ?? baseTextColor`, so bold mode stays byte-identical and a mistaken cell keeps red over the shade. `sameNumberAppearance` default flipped to `"shade"`. No Board/game change — Cell's `sameNumber.background ?? baseFill` already lets dark beat blue-300 and light beat blue-100. Standalone PostCSS compile confirms all amber utilities are generated from the literal classes. Module tests 8→15; full suite 137 passing, tsc + lint clean.
