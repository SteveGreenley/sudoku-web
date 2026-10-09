# Spec: Undo

Status: done

## Problem Statement

While playing, the player can make a wrong turn — place a number, add or remove a note, or stamp a note across a whole dragged selection — and today has no way to take it back. The only remedies are to manually re-erase each cell or to abandon the puzzle with New Game. I want to step back through my own moves (including notes) one at a time, so I can recover from a slip without losing the puzzle.

## Domain language

New terms (candidates for `GLOSSARY.md`):

- **History** — the ordered list of prior board+notes states a game can be restored to by undoing; rebuilt on resume, emptied on a new game.
- **Snapshot** — one entry in the history: the board values and per-cell notes only (never the clock, selection, notes-mode, or win status).
- **Undo step** — one tap of undo: it reverts the most recent single change (a placement, a note, an erase, or a whole multi-cell batch counts as one step).

## Solution

- An **Undo** button sits in the row above the board, alongside the Notes toggle and New Game.
- Tapping it once reverts the most recent change to the board (a placed number, a note added/removed, an erase, or a whole multi-cell note/erase batch). Tapping repeatedly steps back one change at a time.
- There is **no redo**.
- At the start of a game, before any change, the button is **disabled and greyed out**; it enables as soon as the first change is made, and disables again once every change has been undone back to the start.
- Undo reverts **only the board and notes**: the elapsed clock keeps running (never ticks backward), and the current selected cell, the notes-mode setting, and any in-progress selection keep their current values.
- The history is **saved with the game** (so it survives a refresh — you can still undo back to the start after reloading); a New Game clears it.
- Cmd/Ctrl+Z triggers the same undo.

## User Stories

1. As a player, I want an Undo button above the board, so that I can take back my last move without hunting for it.
2. As a player, I want Undo to remove the number I just placed, so that I can correct a wrong guess.
3. As a player, I want Undo to remove a note I just added (and to re-add one I just removed), so that I can fix pencil marks.
4. As a player, I want Undo to restore the number or notes on a cell I just erased, so that I can recover from an accidental erase.
5. As a player, I want a single Undo to revert a whole multi-cell note batch at once (not one cell per tap), so that undoing a batch matches how I made it.
6. As a player, I want a single Undo to revert a whole multi-cell erase at once, for the same reason.
7. As a player, I want to tap Undo repeatedly to step back through all my changes one at a time, so that I can walk the puzzle back as far as I need.
8. As a player, I want Undo to be able to take me all the way back to the start of the game, so that I can discard everything I've done and restart from the givens.
9. As a player, I want the Undo button disabled and greyed at the start of a game, so that it clearly signals there is nothing to undo yet.
10. As a player, I want the button to enable the moment I make my first change, so that I always know when undo is available.
11. As a player, I want the button to disable and grey again once I've undone back to the start, so that I know I've reached the beginning.
12. As a player, I want undo to not run the clock backward, so that the elapsed time stays a fair measure of the attempt.
13. As a player, I want my selected cell and notes-mode to stay where they are when I undo, so that undo doesn't yank my cursor or flip my mode mid-thought.
14. As a player, I want my undo history to survive a refresh, so that I can still undo to the start after reloading.
15. As a player, I want starting a New Game to clear the previous puzzle's history, so that undo never reaches into an old game.
16. As a player, I want to undo with Cmd/Ctrl+Z as well as the button, so I can use whichever is faster.
17. As a player, I want the solved screen to remain the only thing I can act on once I've won, so that I can't accidentally undo a completed puzzle.

## Implementation Decisions

- **State (additive)**: add a `history` field (an ordered list of *snapshots*) to the game state, defaulting to empty. New `Snapshot` type holds only the board values and per-cell notes:
  ```
  interface Snapshot { board: number[]; notes: number[][] }
  ```
  Snapshots deliberately exclude givens, solution, difficulty, the clock (elapsed/startTime), selection (selected/selectedCells/cellSelectionMode), notes-mode, and status — those are unchanging or live UI, so undo never touches them and each stored step stays small. The current board+notes is always exactly one step ahead of the top of the history.
- **Recording a step**: a step is recorded only when a change actually alters board values or notes, detected by a **value** comparison of board and notes before/after (not a reference check — the copy helper re-allocates those arrays on every non-no-op, so reference equality cannot distinguish a real content change from a selection-only one). The recorded snapshot is the state being *left* (pre-change). Selection-only actions (tap, drag, arrows, Escape) and the Notes ON/OFF toggle record nothing.
- **Applying undo**: undo pops the top snapshot, restores its board+notes, leaves every other field as-is, and drops the popped entry. **No redo** — the popped state is discarded; a subsequent change records the post-undo board as the new next-undoable state, so the abandoned branch is simply gone.
- **One action = one step**: a multi-cell note/erase batch is already a single action, so it records one snapshot and undoes in one tap.
- **Button**: a third control in the existing row above the board (Notes, Undo, New Game); disabled + greyed (existing disabled-button styling) when the history is empty, enabled otherwise.
- **Keyboard**: Cmd/Ctrl+Z triggers the same undo; no-op when there is nothing to undo.
- **Win edge**: the winning placement is a content change and is recorded, but the full-screen solved overlay covers the control row so undo is unreachable while solved; undo is a no-op unless the status is "playing."
- **New game / resume**: a new game (button or solved-again) builds a fresh state with empty history; resuming a saved mid-game state restores its persisted history, so the player can undo back to the givens-only start after a refresh.
- **Persistence**: `history` is JSON-safe and rides along with the saved state. Back-compat: an old save without the field back-fills to an empty history on load (the existing load path merges saved fields over defaults), so old saves simply resume with no undo steps.
- **Vocabulary**: existing glossary terms plus the new *history*, *snapshot*, *undo step*.

## Testing Decisions

- Good tests assert only **observable** module behavior — what board/notes/clock/selection/status are after a sequence of actions, and what is persisted — never how the before/after comparison is done internally.
- At the **single existing module seam** (the pure game-logic module), via its existing test files and the injected in-memory storage port; **no new seams, no component/DOM tests** (matching the existing specs' stance of verifying UI by hand).
- Covered:
  - A content change (place / note / erase / multi-cell batch) grows the history by exactly one step, snapshot equal to the pre-change board+notes.
  - A selection-only action and a no-op tap grow the history by zero (a true no-op returns the same reference).
  - Undo restores the popped board+notes, decrements the history, leaves clock/selection/notes-mode/status untouched; undo with an empty history or while solved is a no-op (same reference).
  - N content changes undo N times back to the givens-only start (history empty).
  - Undo-then-new-change abandons the undone branch (no redo).
  - New game → empty history; a populated history round-trips through the storage port; a pre-feature save back-fills to empty; a snapshot serializes only board+notes.

## Out of Scope

- Redo.
- Rewinding the elapsed clock.
- Undoing selection, notes-mode, or win status (live UI, not board changes).
- Any cap on history depth (full rewind to start is the intent; snapshots stay lean instead).
- Hints, dark mode, and everything already in the app's Out of Scope list.

## Further Notes

- Complements, not conflicts with, the solution-based-mistake-feedback ADR: wrong-placement highlighting is derived from the current board, so it simply recomputes after an undo.
- Clock-never-rewinds and keep-selection/notes-mode are deliberate UX choices (undo touches only board+notes), confirmed with the player.
- **No prefactor required**: the change is additive (one state field + a few pure functions + one UI control), routed through the existing single commit path.
