# Sudoku

A sudoku game that plays entirely in the browser. Next.js (App Router) as the
React host, TypeScript, Tailwind CSS — no account, no backend, no network.

## Commands

- `npm run dev` — start the dev server
- `npm test` — run the test suite (Vitest)
- `npm run build` — production build
- `npm run lint` — ESLint

## Layout

- `src/game/` — the pure game-logic module: state shape and action functions.
  All game rules live here; all tests target this seam.
- `src/components/` — thin React presentation layer that renders the module's
  state. Contains no game rules.

Spec: [`.scratch/sudoku/spec.md`](.scratch/sudoku/spec.md) · Domain
vocabulary: [`GLOSSARY.md`](GLOSSARY.md)
