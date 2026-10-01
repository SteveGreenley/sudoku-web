import { generatePuzzle, type Rng } from "./generator";
import { getDisabledNumbers } from "./highlights";
import {
  CELLS,
  createInitialState,
  SIZE,
  type Difficulty,
  type GameState,
} from "./state";

export interface StoragePort {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

const STORAGE_KEY = "sudoku_state";
const DIFFICULTY_KEY = "sudoku_lastDifficulty";

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
  if (state.status !== "playing") return state;
  const next = copy(state);
  next.selected = cell;
  return next;
}

export function startGameTimer(state: GameState): GameState {
  if (state.status !== "playing" || state.elapsedMs > 0 || state.startTime !== undefined) {
    return state;
  }
  const next = copy(state);
  next.startTime = Date.now();
  return next;
}

export function checkWin(state: GameState): GameState {
  if (state.status !== "playing") return state;
  for (let i = 0; i < CELLS; i++) {
    if (state.board[i] !== state.solution[i]) return state;
  }
  const next = copy(state);
  next.status = "solved";
  return next;
}

export function place(state: GameState, cell: number, value: number): GameState {
  if (!validCell(cell) || !validValue(value)) return state;
  if (state.givens[cell]) return state;
  const disabled = getDisabledNumbers(state);
  if (disabled.has(value)) return state;
  const next = copy(startGameTimer(state));
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
  return checkWin(next);
}

export function toggleNote(state: GameState, cell: number, value: number): GameState {
  if (!validCell(cell) || !validValue(value)) return state;
  if (state.givens[cell] || state.board[cell] !== 0) return state;
  const next = copy(startGameTimer(state));
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
  const next = copy(startGameTimer(state));
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
    startTime: undefined,
  };
}

export function saveState(state: GameState, storage: StoragePort): void {
  storage.set(STORAGE_KEY, JSON.stringify(state));
}

export function loadState(storage: StoragePort): GameState | null {
  try {
    const raw = storage.get(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function discardState(storage: StoragePort): void {
  storage.set(STORAGE_KEY, "");
}

export function saveLastDifficulty(difficulty: Difficulty | null, storage: StoragePort): void {
  if (difficulty === null) return;
  storage.set(DIFFICULTY_KEY, difficulty);
}

export function getLastDifficulty(storage: StoragePort): Difficulty | null {
  return (storage.get(DIFFICULTY_KEY) as Difficulty | null) ?? null;
}
