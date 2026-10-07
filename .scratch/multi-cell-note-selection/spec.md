# Spec: Multi-cell note selection (drag gesture)

Status: ready-for-agent

## Problem Statement

While noting a puzzle, the player currently toggles notes on, taps one empty cell, and enters each note one cell at a time — then moves to the next cell and repeats. When several empty cells plausibly share the same candidates, that is tedious. I want to drag across a group of empty cells to select them all at once, then apply (or remove) a note to the whole selection in a single action.

## Domain language

Two new terms (candidates for `GLOSSARY.md`):

- **incompleted** — a cell with no placed number (`board[cell] === 0`), including cells that already hold notes. Givens and cells holding a number are **completed**. Only incompleted cells are ever selectable for this feature.
- **cell selection** — a mode entered by dragging across incompleted cells, in which a *set* of incompleted cells is selected together for batch note editing. It is distinct from the existing single-cell selection.

## Solution

A drag gesture that selects multiple incompleted cells for batch note editing, layered onto (not replacing) the existing single-cell model:

- Press and drag across the board: incompleted cells the pointer sweeps over become selected; completed/given cells are skipped. Notes mode switches on automatically.
- The app enters **cell selection** mode. While in it, tapping an incompleted cell toggles it in/out of the selection; tapping a completed/given cell does nothing.
- While one or more cells are selected, notes mode is on, and the number pad (and keyboard) apply a **per-cell toggle** of the chosen note across every selected cell. Erase clears notes from all selected cells.
- Each selected cell is marked with a dashed outline so the selection reads clearly; the single-cell row/column/box + same-number highlighting is suppressed in this mode.
- The mode ends when the selection empties (toggle off the last cell, Escape, or tapping outside the board); the app returns to normal single-cell behavior.
- Works with both mouse and touch.

## User Stories

1. As a player, I want to drag across several empty cells to select them all at once, so that I can annotate a group without tapping each one.
2. As a player, I want only empty (incompleted) cells to be selectable during a drag, so that I never accidentally touch fixed or already-filled cells.
3. As a player, I want notes mode to switch on automatically once I have selected more than one cell, so that my next number entry writes notes rather than a committed guess.
4. As a player, I want to tap an empty cell to add or remove it from the current selection, so that I can refine the group I am about to note.
5. As a player, I want tapping a filled or given cell to do nothing while I am selecting, so that my in-progress selection is never disturbed.
6. As a player, I want pressing a number to add or remove that note on every selected cell, so that I can stamp a candidate across the whole group at once.
7. As a player, I want the Erase button to clear notes from every selected cell, so that I can undo a batch.
8. As a player, I want a clear visual (a dashed outline) on each selected cell, so that I always know exactly which cells my next note will land on.
9. As a player, I want the usual row/column/box and same-number highlighting to step aside while I am selecting, so that the board is not a wall of competing fills.
10. As a player, I want the selection cancelled — and notes mode to drop back off — by toggling off the last cell, pressing Escape, or tapping outside the board, so that I can abandon the batch cleanly.
11. As a player, I want a plain tap (no drag) on a cell to keep working exactly as it does today — single-cell selection, manual notes toggle — so that the new gesture is opt-in, not a replacement.
12. As a player, I want this to work with a finger on my phone and with a mouse, so that I can use it anywhere.
13. As a player, I want an in-progress multi-cell selection to survive a refresh, so that I do not lose a batch I was about to apply.

## Implementation Decisions

- **State (additive)**: keep `selected` (the *primary* / last-touched cell) and add `selectedCells: number[]` and `cellSelectionMode: boolean` to `GameState`. Invariants, enforced in the pure actions: `selectedCells` holds only incompleted (non-given) cells; when `selected !== null`, `selected ∈ selectedCells`; in normal mode `selectedCells` is `[]` or `[selected]` and `cellSelectionMode` is false.
- **Notes mode is derived in the mode**: effective notes mode = the stored `notesMode` in normal mode; in cell selection mode it is ON whenever `selectedCells.length >= 1`. The stored `notesMode` is left untouched while in the mode and re-applies on exit, so a normal-mode manual toggle is never clobbered. The Notes button, while in the mode, shows ON and acts as "clear the selection."
- **The gesture**: Pointer Events on the board. On `pointerdown` over an incompleted cell, record the origin and begin a candidate drag. On `pointermove`, hit-test the pointer position with `document.elementFromPoint()` to find the cell under it and add incompleted cells to the selection (completed/given skipped). The board sets `touch-action: none` and the first cell releases pointer capture so touch sweeping fires hit-tests. A tap vs a drag is decided by a small movement threshold (~8px): below it, the gesture releases as a normal tap. Cell selection mode turns on the moment the drag selects a **second** incompleted cell; a drag that never reaches a second incompleted cell is released as a plain tap (origin single-selected, notes unchanged, mode off).
- **Cell selection mode actions** (all in the pure module, mirroring the pad/keyboard):
  - **Toggle a cell**: tapping an incompleted cell adds/removes it in `selectedCells` and sets it as the primary `selected`; tapping a completed/given cell is a no-op.
  - **Apply note**: per-cell independent toggle of the note across every cell in `selectedCells` — each cell adds it if absent, removes it if present. Numbers already complete in a unit stay disabled, as today.
  - **Erase**: clear notes on every cell in `selectedCells`.
  - **Placement** remains **single-cell** (acts on the primary `selected` only); there is no multi-placement.
  - **Exit**: Escape, or an empty selection, ends the mode and returns to normal single-cell behavior.
  - A selected cell that gains a number (becomes completed) is dropped from `selectedCells`.
- **Highlighting**: in cell selection mode the single-cell row/column/box fill and same-number / bold-notes highlighting are suppressed. Each selected cell is marked with a dashed **inner inset** outline (an accent color, drawn inset so it does not collide with the shared grid-line borders) over a neutral background. Normal-mode single selection keeps the existing solid fill + highlights unchanged.
- **Input parity**: the number pad, the keyboard (1–9, Backspace), and the Erase button all route through the same multi-selection actions while in the mode; arrow keys move the primary cell. Normal-mode inputs are unchanged.
- **Persistence**: `selectedCells` and `cellSelectionMode` are JSON-safe and auto-save/resume alongside `selected`, so an in-progress batch survives a reload.
- **Vocabulary**: uses the glossary terms (board, cell, box, given, note) plus the new *incompleted*, *cell selection*, and *primary* terms.
- **Accepted invariant exceptions**: the *primary* (`selected`) may point at a cell that is not a member of `selectedCells` — after placing on the primary (it completes and drops out) or after an arrow-key move onto a new incompleted, given, or completed cell; the batch (`selectedCells`) always stays exactly as the user built it. A fresh single tap is a 1-cell selection with `cellSelectionMode` off, while a set trimmed to one cell keeps the flag on (notes stay on, the one cell stays marked); the flag falls only when the set empties. The keyboard matches the number pad's disabled-number behaviour (a number complete on the board does nothing).

## Testing Decisions

- **At the module seam** (the pure game-logic module; no component/DOM tests, per the existing spec):
  - **Invariants**: `selectedCells` never contains a given or a completed cell; `selected ∈ selectedCells`; normal-mode `selectedCells` is `[]` or `[selected]`.
  - **Selection**: adding/removing a cell by index; a completed cell cannot be selected; a cell that becomes completed drops out; the mode flag flips on at two selected cells and off at zero.
  - **Apply note across the set**: per-cell toggle semantics — a cell with the note loses it, a cell without gains it, in one action; disabled numbers are not noted.
  - **Erase across the set**: notes cleared on every selected cell; non-selected cells untouched.
  - **Mode exit**: emptying the selection clears `cellSelectionMode` and restores normal-mode notes behavior.
  - **Persistence**: save/restore round-trip of `selectedCells` + `cellSelectionMode` through the injected storage port (in-memory fake).
- **Not tested**: the pointer / hit-test gesture itself (React/DOM) — verified manually against the gesture user stories, matching the existing spec's "no component or e2e tests" stance.

## Out of Scope

- Multi-cell **number placement** (notes + erase only; placement stays single-cell).
- Selecting givens or completed cells (never selectable in this feature).
- Row/column/box or same-number highlighting while in cell selection mode (suppressed, not reworked).
- Everything in the existing app's Out of Scope list (undo, hints, dark mode, etc.).

## Further Notes

- Layered on the existing single-cell model, not a replacement: a tap with no drag is the current behavior.
- Two new domain terms (*incompleted*, *cell selection*) are proposed for `GLOSSARY.md`; add them when the feature lands.
- The dashed-outline marker is drawn as an inset outline specifically because the grid's lines are the shared right/bottom borders of adjacent cells — a literal outer dashed border would fight those lines.
