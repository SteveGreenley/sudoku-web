import { generatePuzzle, type Rng } from "./generator";
import { CELLS, createInitialState, SIZE, type Difficulty, type GameState } from "./state";

function validCell(cell: number): boolean {
  return Number.isInteger(cell) && cell >= 0 && cell < CELLS;
}

function validValue(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

function copy(state: GameState): GameState {
  return {
    ...state,
    board: [...state.board],
    notes: state.notes.map((n) => [...n]),
  };
}

export function select(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  const next = copy(state);
  next.selected = cell;
  return next;
}

export function place(state: GameState, cell: number, value: number): GameState {
  if (!validCell(cell) || !validValue(value)) return state;
  if (state.givens[cell]) return state;
  const next = copy(state);
  next.board[cell] = value;
  next.notes[cell] = [];
  // Auto-erase: remove this number from notes of cells in same row, column, box
  const row = Math.floor(cell / SIZE);
  const col = cell % SIZE;
  for (let i = 0; i < CELLS; i++) {
    if (i === cell) continue;
    if (next.board[i] !== 0) continue;
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const inSameRow = r === row;
    const inSameCol = c === col;
    const inSameBox =
      Math.floor(r / 3) === Math.floor(row / 3) &&
      Math.floor(c / 3) === Math.floor(col / 3);
    if (inSameRow || inSameCol || inSameBox) {
      next.notes[i] = next.notes[i].filter((n) => n !== value);
    }
  }
  return next;
}

export function toggleNote(state: GameState, cell: number, value: number): GameState {
  if (!validCell(cell) || !validValue(value)) return state;
  if (state.givens[cell] || state.board[cell] !== 0) return state;
  const next = copy(state);
  const notes = next.notes[cell];
  next.notes[cell] = notes.includes(value)
    ? notes.filter((n) => n !== value)
    : [...notes, value].sort((a, b) => a - b);
  return next;
}

export function erase(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  if (state.givens[cell]) return state;
  if (state.board[cell] === 0 && state.notes[cell].length === 0) return state;
  const next = copy(state);
  if (next.board[cell] !== 0) {
    next.board[cell] = 0;
  } else {
    next.notes[cell] = [];
  }
  return next;
}

export function startGame(difficulty: Difficulty, rng: Rng = Math.random): GameState {
  const { givens, solution } = generatePuzzle(difficulty, rng);
  return {
    ...createInitialState(),
    difficulty,
    givens,
    solution: [...solution],
    board: solution.map((value, i) => (givens[i] ? value : 0)),
  };
}
