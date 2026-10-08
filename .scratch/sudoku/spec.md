# Spec: Sudoku

Status: done

## Problem Statement

I want to play sudoku in my browser: a game that tells me immediately when a number I place is wrong, lets me keep pencil-style notes on cells, and helps me orient myself on the board — when I select a cell it shows me its row, column and box, and emphasises every other place that number appears. I don't want an account, a backend, or any network dependency; I want my game to survive a refresh.

## Solution

A client-side single-page game on Next.js (React, TypeScript, Tailwind), playing entirely in the browser:

- Start a game by choosing a difficulty (Easy / Medium / Hard / Expert); a valid puzzle with exactly one solution is generated in-app.
- Place numbers with an on-screen number pad or the keyboard; take notes with a notes-mode toggle; erase with a button or Backspace.
- Immediate feedback: a number that does not match the solution for that cell stays on the board but is shown red (a mistake). Feedback is solution-based per ADR 0001, not visible-conflict detection.
- Selecting a cell fills its row, column and box, gives the cell itself the strongest fill, and bolds every other instance of that number on the board.
- A timer runs from first input until the board is complete and correct, ending in a "solved" overlay with the time.
- The current game auto-saves to the browser and resumes on reload; New Game confirms before discarding.

No server, no account, no network dependency.

## User Stories

1. As a player, I want to choose a difficulty when starting a new game, so that I can match the challenge to my mood and skill.
2. As a player, I want every new game to get a freshly generated puzzle, so that no two sessions feel the same.
3. As a player, I want generated puzzles to have exactly one solution, so that my deductions are sound.
4. As a player, I want the givens of a puzzle pre-filled and visually distinct from cells I can change, so I always know what is fixed.
5. As a player, I want to select a cell by clicking or tapping it, so that I can act on it.
6. As a player, I want givens to be selectable but never editable, so that I can inspect their context without corrupting the puzzle.
7. As a player, I want an always-visible number pad (1–9), so that I can play on a phone without a keyboard.
8. As a player, I want pressing 1–9 to place that number in the selected cell, so that I can play fast at a desk.
9. As a player, I want arrow keys to move the selection, so that I never have to hunt for the mouse.
10. As a player, I want Backspace to clear the selected cell, so that I can correct myself quickly.
11. As a player, I want an Erase button, so that I can clear the selected cell on touch devices.
12. As a player, I want a notes-mode toggle, so that I can record possibilities without committing to them.
13. As a player, I want number-pad input in notes mode to add or remove that note on the selected cell, so that I can track what each empty cell could be.
14. As a player, I want placing a number that matches the solution to automatically remove that number from the notes of every other cell in its row, column and box, so that my notes stay clean as I progress.
15. As a player, I want a number that does not match the solution to stay on the board but be shown red, so that I immediately know it is a mistake and can keep experimenting.
16. As a player, I want a mistaken placement not to erase notes from other cells, so that one wrong guess cannot destroy correct deductions.
17. As a player, I want the selected cell's row, column and box to be filled, so that I can see the scope of its constraints at a glance.
18. As a player, I want the selected cell itself to have the strongest fill, so that I always know exactly which cell I am acting on.
19. As a player, I want every other instance of the selected cell's number to render bold, so that I can track where that number already lives.
20. As a player, I want a cell holding only notes to still highlight its row, column and box when selected (without any bolding), so that I keep my bearings while annotating.
21. As a player, I want an elapsed-time timer, so that I can pace myself.
22. As a player, I want the timer to start on my first input rather than when the puzzle appears, so that I am not clocked while I read the board.
23. As a player, I want a "solved" overlay showing my time and a New Game button when I complete the board correctly, so that winning feels like a moment.
24. As a player, I want a board containing any mistake to count as not solved, so that I must fix red cells before the game ends.
25. As a player, I want my in-progress game to auto-save and resume after a refresh or restart, so that I never lose a game.
26. As a player, I want to be asked to confirm before New Game discards an in-progress game, so that I cannot lose progress by accident.
27. As a player, I want my last chosen difficulty remembered as the default, so that I don't re-pick it every time.
28. As a player, I want to overwrite an existing placed number in a cell, so that I can change my mind in place.
29. As a player, I want the layout to adapt (number pad beside the board on desktop, below it on phones), so that the game is comfortable on any screen.
30. As a player, I want the whole game to run offline in the browser with no account, so that it works anywhere.
31. As a player, I want mistake feedback to reflect the puzzle's true solution rather than merely visible duplicates, so that I am told about a wrong number even before it visibly clashes with anything.

## Implementation Decisions

- **Stack**: Next.js (App Router) as a client-side SPA; TypeScript; Tailwind CSS. No API routes, no server state, no auth. The page is a client component; Next.js is the React host only.
- **Architecture**: one pure, framework-free game-logic module (the app's single deep module) plus a thin React presentation layer. The module owns the entire game model and rules; React renders its state and dispatches its actions. No game rule lives in a component.
- **Game state**: a single plain, serializable object holding difficulty, the givens mask, the full solution, the current board, per-cell notes, the selected cell, the notes-mode flag, elapsed time, and status (playing / solved). Every field is JSON-safe so the object saves as-is.
- **Generator**: build a complete valid grid, then remove cells according to a per-difficulty budget (Easy removes the fewest, Expert the most). After removal, verify the puzzle has exactly one solution (count solutions up to two); if more, remove fewer cells or regenerate.
- **Mistakes are derived, not stored**: a cell is a mistake exactly when it holds a number different from the solution for that cell. Nothing beyond the board is persisted for this; red state is recomputed on every render. Follows ADR 0001.
- **Placement rules**:
  - Placing a number into a cell clears that cell's notes and sets the number; givens ignore placement entirely.
  - If the number matches the solution for that cell, it is removed from the notes of every other cell in the same row, column, and box.
  - If it does not match, nothing else changes (no note-erasing) — the cell simply shows as a mistake.
  - Overwriting an existing placed number re-runs the same rules against the new number.
  - Erasing a cell that holds a number clears the number; erasing an empty cell clears its notes.
  - Notes exist only on empty cells and are never validated against the solution.
- **Highlights are derived**: selecting a cell derives its row, column, and box membership plus the set of all other cells holding the same number; the UI applies fills and bold from these. No highlight state is stored.
- **Winning**: the game is solved exactly when every cell holds a number and the board equals the solution; status flips once and the overlay appears.
- **Timer**: elapsed time is accumulated in the game state (so it survives reloads) and starts on the first user input; a client-side tick updates the display.
- **Persistence**: the module accepts an injected storage port (save / load of the game object). The app implements it with localStorage; tests use an in-memory fake. A saved game resumes on load; the last-used difficulty is kept in a small separate settings entry in the same storage.
- **UI structure**: header (title, current difficulty, timer); the board as a 9×9 grid of cells with heavier borders around each box; a controls row (New Game, notes-mode toggle, Erase); the number pad; the solved overlay; a New Game flow that confirms discarding an in-progress game and then offers the difficulty choice.
- **Vocabulary**: the codebase uses the glossary's terms — board, cell, box, given, solution, mistake, note — and avoids the synonyms the glossary lists.

## Testing Decisions

- **What a good test is**: tests exercise the game-logic module's public API only — an action in, the resulting state and derivations out. No test asserts on React components, the DOM, or module internals.
- **The single seam** (confirmed with the user): the pure game-logic module. Everything the spec promises is asserted at this seam:
  - generation: valid grid, correct removal budget per difficulty, exactly one solution
  - placement: correct placement, mistaken placement (red derivation), overwriting, givens untouchable
  - notes: add/remove in notes mode, auto-erase on correct placement only, never erased by a mistaken placement, notes only on empty cells
  - highlights: row/column/box membership, bold set for the selected number, notes-only selection
  - winning: full-and-correct board flips to solved; any mistake prevents it
  - timer: starts on first input, accumulates, survives save/restore
  - persistence: save/restore round-trip through the injected storage port using an in-memory fake
- **Prior art**: none — the repo is greenfield; scaffolding the Next.js app introduces the test runner, and all tests live at the module seam.
- **Not tested in v1**: React components and end-to-end browser behavior (fills, bold styling, keyboard handling, layout) are verified manually against the user stories.

## Out of Scope

- Undo / redo
- Hints, solution reveal, or any "show me" affordance
- Remaining-count display on the number pad
- Scoring, statistics, or leaderboards
- Multiple simultaneous saved games; cloud sync; accounts
- Constraint-based (visible-conflict) feedback — deliberately absent per ADR 0001
- Dark mode / theming beyond a single default theme
- Sound, animations beyond the solved overlay, localization

## Further Notes

- This spec was synthesized from the design session; the repo-root `SPEC.md` is that session's working note, and this file is the published, canonical spec.
- The repo is docs-only today (no code, no git repository). The first implementation step is scaffolding the Next.js app; everything above builds on top of it.
- ADR 0001 consequence, accepted: because mistake feedback compares against the solution, a determined player can brute-force the whole solution by probing 1–9 in a cell. Strong feedback was deliberately chosen over puzzle purity.
- Test seams were confirmed with the user before writing: one seam (the pure module plus injected storage port); no component or e2e tests in v1.
