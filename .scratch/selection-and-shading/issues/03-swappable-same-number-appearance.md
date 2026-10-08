# 03: Prefactor — swappable same-number appearance

**What to build:** The way a cell that holds the same number as the selected filled cell is styled is extracted from the cell's render logic into a small, pure, unit-tested style module with a single switch: `bold` (today's behavior) or `shade` (filled in by tickets 04/05). The default stays `bold`, so there is zero visual or behavioral change from this ticket. After it lands, any experiment on the same-number appearance is a one-line change in one place, without touching the cell or board render code.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] One constant in a dedicated style module selects the same-number appearance (`bold` | `shade`); the cell component receives its same-number styling from that module instead of deriving it inline.
- [x] With the switch set to `bold`, the app is pixel-identical to today: same-number cells (givens and placed alike, mistaken or not) render bold; same-number note instances in empty cells render bold.
- [x] The `shade` branch exists as the swappable slot (a placeholder rendering the current bold is acceptable — 04/05 replace it).
- [x] The style derivation is a pure function of (cell value, is selected, in same-number set, switch) → style, and is unit-tested without React/DOM, matching the repo's no-component-tests stance.
- [x] The same-number highlight remains fully suppressed while in cell selection, as today.
- [x] Full existing test suite, lint, and typecheck pass with no visible change.

## Comments

- 2026-10-08: Implemented on `selection-and-shading`. New `src/components/sameNumberStyle.ts` (plain TS, no React) with `sameNumberAppearance` switch (default `"bold"`) and `sameNumberStyle(value, isSelected, isSameNumber, isSameNoteNumber, appearance) → { background, text, noteEmphasis }` (each slot null = "keep the cell's own cascade"). `Cell` composes the three slots with `??` over its existing fill/weight cascades; the generic row/column/box + selection fill and the color cascade stay in `Cell`, so in `bold` mode every output slot is null or `font-black` exactly as before — pixel-identical. `Board`/game module untouched. 8 new unit tests pin the bold output; full suite 130 passing, tsc + lint clean. Note: the function takes 5 inputs, not the ticket's 4 — `isSameNoteNumber` is required for the note-digit emphasis slot the ticket itself demands.
