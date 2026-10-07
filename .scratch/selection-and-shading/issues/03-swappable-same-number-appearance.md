# 03: Prefactor — swappable same-number appearance

**What to build:** The way a cell that holds the same number as the selected filled cell is styled is extracted from the cell's render logic into a small, pure, unit-tested style module with a single switch: `bold` (today's behavior) or `shade` (filled in by tickets 04/05). The default stays `bold`, so there is zero visual or behavioral change from this ticket. After it lands, any experiment on the same-number appearance is a one-line change in one place, without touching the cell or board render code.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] One constant in a dedicated style module selects the same-number appearance (`bold` | `shade`); the cell component receives its same-number styling from that module instead of deriving it inline.
- [ ] With the switch set to `bold`, the app is pixel-identical to today: same-number cells (givens and placed alike, mistaken or not) render bold; same-number note instances in empty cells render bold.
- [ ] The `shade` branch exists as the swappable slot (a placeholder rendering the current bold is acceptable — 04/05 replace it).
- [ ] The style derivation is a pure function of (cell value, is selected, in same-number set, switch) → style, and is unit-tested without React/DOM, matching the repo's no-component-tests stance.
- [ ] The same-number highlight remains fully suppressed while in cell selection, as today.
- [ ] Full existing test suite, lint, and typecheck pass with no visible change.
