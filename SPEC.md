# Spec — Sudoku SPA

A single-puzzle sudoku game for the browser. React SPA on Next.js; plays entirely client-side.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Game logic (generator, rules, state transitions) lives in a pure, framework-free, unit-tested module; React renders it
- No API routes, no server state, no auth

## Domain language

See [GLOSSARY.md](./GLOSSARY.md). Key decision: mistakes are judged against the solution — [ADR 0001](./docs/adr/0001-solution-based-mistake-feedback.md).

## Game

- A game = difficulty, puzzle (givens), solution, current board, notes, elapsed time, status
- Puzzles generated in-app: build a complete grid, then remove cells; fewer removals = easier
- Four difficulties: Easy, Medium, Hard, Expert
- Won when the board is complete and equal to the solution

## Placement rules

- Placing a number in a cell:
  - Matches the solution for that cell → accepted; that number is erased from the notes of every other cell in its row, column, and box
  - Does not match → accepted and marked red (a mistake); no note-erasing
- Overwriting an existing placed number follows the same rules
- Givens are never editable
- Notes are never validated against the solution

## Input

- Click/tap selects a cell; givens are selectable but not editable
- On-screen number pad 1–9, always visible
- Keyboard: 1–9 places, arrows move the selection, Backspace erases
- Notes mode: toggle button; while on, pad input adds/removes notes on the selected cell
- Erase button: clears the selected cell's number or notes

## Highlighting (on cell selection)

- The selected cell's row, column, and box are filled; the selected cell itself gets the strongest fill
- Every other cell on the board holding the same number renders bold (givens and placed alike, mistaken or not)
- A notes-only cell (no number): row/column/box filled, no bolding

## Timer and win

- Timer starts on first user input, runs until solved, survives reload
- On win: "solved" overlay with elapsed time and a New Game button

## New game

- New Game button → confirm (discards in-progress game) → choose difficulty → fresh puzzle
- Remembers the last difficulty as the default

## Persistence

- Current game (board, notes, difficulty, elapsed time) auto-saves to localStorage and resumes on reload

## Layout

- Header: title, difficulty, timer
- Board: 9×9 grid with heavier 3×3 box borders
- Controls row: New Game, Notes toggle, Erase
- Number pad: beside the board in landscape (width > height), below it in portrait
  - In landscape the number pad is a 3×3 grid (9 buttons); the Erase button moves to a top button row (Notes, Undo, New Game, Erase) above the grid
  - The board grows in landscape to fill available height, capped so the board and panel fit the width
  - A small client-side hook tracks viewport aspect (innerWidth > innerHeight); a square window (width == height) uses the portrait layout

## Out of scope (v1)

- No undo/redo
- No hints or solution reveal
- No remaining-count display on the pad
- No scoring, stats, or multiple simultaneous saved games
- No constraint-based (conflict) feedback — see ADR 0001
