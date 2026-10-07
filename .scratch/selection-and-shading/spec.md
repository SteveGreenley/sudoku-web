# Spec: Selection fixes and same-number shading

Status: ready-for-agent

## Problem Statement

Three improvements to the board's selection and highlighting behavior, reported together:

1. **Tapping a filled number keeps the note batch.** While a batch of incompleted cells is selected for notes (cell selection), tapping a cell that holds a number does nothing — the in-progress batch is silently kept. The tap should exit the batch and select that number.
2. **A drag drags in the pre-selected filled cell.** If a filled cell was single-selected (normal mode) before a drag, the drag grows the batch around it and the filled cell ends up in the selection — dashed marker on it, and a batch erase would wipe its number.
3. **Same-number highlight is bold-only.** Every other cell holding the same number as the selected filled cell renders bold. We want an alternative: a background shade — darker on the selected cell, lighter on the other instances — with the shade color optionally keyed to the number's value via a palette of nine attractive colors that do not conflict with the app's existing colors.

## Domain language

Per `GLOSSARY.md`: board, cell, box, given, note, incompleted, cell selection, primary, mistake. No new terms. "Same-number cells" = the cells holding the same value as the selected filled cell (givens and placed alike, mistaken or not).

## Decisions

- **Clicking a filled number in cell selection** ends the mode and single-selects that cell (a deliberate change from the multi-cell-note-selection decision that such a tap "does nothing"); it then behaves exactly like a normal-mode tap, including the existing re-place note-erase for a placed non-given cell. Tapping an incompleted cell still toggles batch membership.
- **The batch only ever holds incompleted cells once it starts growing.** When a drag begins a fresh batch (normal mode → cell selection), any completed cell mirrored in the set by the single-select is pruned; pre-existing incompleted members of an active batch are kept.
- **The same-number appearance is a code-level switch** (`bold` | `shade`) in a small, pure, unit-tested style module — no UI control for now; experiments are one-line changes in one place. Default stays `bold`, so there is zero visual change until the switch is flipped.
- **Shade coverage**: every cell holding the number (givens and placed, mistaken or not) is shaded; same-number *note* instances in empty cells keep their current bold, unchanged.
- **Shade rendering**: the selected filled cell gets the dark variant of the shade (replacing the blue selection fill); other same-number instances get the light variant (winning over the row/column/box fill when both apply); digits stay legible on both; mistakes keep their red text; all single-cell highlights — shade included — stay suppressed while in cell selection.
- **Per-value palette**: nine colors, one per number 1–9, each with a dark + light variant, mutually distinguishable and clear of the app's blue selection/highlight fills, red mistake color, and zinc neutrals. Starting proposal: 1 rose, 2 orange, 3 amber, 4 yellow, 5 lime, 6 emerald, 7 teal, 8 cyan, 9 violet.

## Tickets

- `issues/01-click-filled-exits-selection.md` — no blockers
- `issues/02-drag-excludes-prior-filled-cell.md` — no blockers
- `issues/03-swappable-same-number-appearance.md` — no blockers (prefactor)
- `issues/04-shade-same-number-cells.md` — blocked by 03
- `issues/05-per-value-shade-palette.md` — blocked by 04
