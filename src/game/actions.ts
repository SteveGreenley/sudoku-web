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
    selectedCells: [...state.selectedCells],
  };
}

export function select(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  if (state.status !== "playing") return state;
  const next = copy(state);
  next.selected = cell;
  next.selectedCells = [cell];
  next.cellSelectionMode = false;
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
  // The placed cell is now completed, so it can no longer belong to the
  // multi-cell selection. `selected` is left where it was: placement is not a
  // selection action, and normal single-cell play keeps its selected cell.
  next.selectedCells = next.selectedCells.filter((i) => i !== cell);
  next.cellSelectionMode = next.selectedCells.length >= 2;
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

// A cell is "incompleted" when it is not a given and holds no number. Only
// incompleted cells may enter the multi-cell selection.
function isIncompleted(state: GameState, cell: number): boolean {
  return !state.givens[cell] && state.board[cell] === 0;
}

// Toggles `value` on the notes of every cell in the multi-selection in a single
// action: a cell with the note loses it, a cell without it gains it. Given and
// completed cells in the set are skipped. Selection membership, the primary, and
// the mode flag are untouched — changing a cell's notes never changes who is
// selected. No-op when the set is empty or `value` is invalid.
export function applyNoteToSelection(state: GameState, value: number): GameState {
  if (state.status !== "playing") return state;
  if (!validValue(value) || state.selectedCells.length === 0) return state;
  const next = copy(startGameTimer(state));
  for (const cell of next.selectedCells) {
    if (!isIncompleted(next, cell)) continue;
    const notes = next.notes[cell];
    next.notes[cell] = notes.includes(value)
      ? notes.filter((n) => n !== value)
      : [...notes, value].sort((a, b) => a - b);
  }
  return next;
}

// Clears the notes on every cell in the multi-selection in a single action.
// Members are incompleted by construction, so this clears their notes; a member
// that somehow holds a number has it cleared, mirroring `erase`. Selection
// membership, the primary, and the mode flag are untouched. No-op when the set
// is empty or when no selected cell has a number or notes to clear.
export function eraseSelection(state: GameState): GameState {
  if (state.status !== "playing") return state;
  if (state.selectedCells.length === 0) return state;
  let hasSomething = false;
  for (const cell of state.selectedCells) {
    if (state.givens[cell]) continue;
    if (state.board[cell] !== 0 || state.notes[cell].length > 0) {
      hasSomething = true;
      break;
    }
  }
  if (!hasSomething) return state;
  const next = copy(startGameTimer(state));
  for (const cell of next.selectedCells) {
    if (next.givens[cell]) continue;
    if (next.board[cell] !== 0) {
      next.board[cell] = 0;
    } else {
      next.notes[cell] = [];
    }
  }
  return next;
}

// Appends every valid, incompleted cell that is not already selected, in order.
// A cell that is a given, completed, out of range, or already in the set is
// skipped. The primary `selected` becomes the last cell added and the mode flag
// is derived from the resulting set size. Returns the input state untouched when
// nothing was added.
export function addSelectedCells(state: GameState, cells: number[]): GameState {
  if (state.status !== "playing") return state;
  const set = [...state.selectedCells];
  let added = false;
  for (const cell of cells) {
    if (!validCell(cell)) continue;
    if (!isIncompleted(state, cell)) continue;
    if (set.includes(cell)) continue;
    set.push(cell);
    added = true;
  }
  if (!added) return state;
  const next = copy(state);
  next.selectedCells = set;
  next.selected = set[set.length - 1];
  next.cellSelectionMode = set.length >= 2;
  return next;
}

// Toggles a single cell in the set: removes it if present, otherwise adds it if
// it is incompleted. Givens and completed cells that are not already selected are
// ignored. The primary `selected` tracks the last member of the set (or null when
// it empties) and the mode flag is derived from the set size.
export function toggleSelectedCell(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  if (state.status !== "playing") return state;
  const next = copy(state);
  if (next.selectedCells.includes(cell)) {
    next.selectedCells = next.selectedCells.filter((i) => i !== cell);
  } else if (isIncompleted(state, cell)) {
    next.selectedCells.push(cell);
  } else {
    return state;
  }
  next.selected =
    next.selectedCells.length > 0 ? next.selectedCells[next.selectedCells.length - 1] : null;
  next.cellSelectionMode = next.selectedCells.length >= 2;
  return next;
}

// Clears the multi-cell selection entirely, returning to a deselected normal state.
// The stored `notesMode` is left untouched so a manual normal-mode toggle re-applies
// on the way out of the mode. No-op when there is already nothing selected.
export function clearSelection(state: GameState): GameState {
  if (state.status !== "playing") return state;
  if (state.selectedCells.length === 0 && state.selected === null && !state.cellSelectionMode) {
    return state;
  }
  const next = copy(state);
  next.selectedCells = [];
  next.selected = null;
  next.cellSelectionMode = false;
  return next;
}

// Moves the primary (last-touched) pointer to `cell` for arrow-key navigation in
// cell selection mode. An incompleted `cell` is added to the set as its last
// element when it is not already a member; a given or completed cell is taken as
// the primary alone (a harmless cosmetic exception — the UI marks only actual
// set members). The set is never shrunk and the mode flag is re-derived from its
// size, so navigation never collapses the selection or exits the mode.
export function movePrimary(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  if (state.status !== "playing") return state;
  const next = copy(state);
  next.selected = cell;
  if (isIncompleted(state, cell) && !next.selectedCells.includes(cell)) {
    next.selectedCells.push(cell);
  }
  next.cellSelectionMode = next.selectedCells.length >= 2;
  return next;
}

// The notes mode the UI should act on. In cell selection it is on whenever any cell
// is selected; in normal mode it is the stored manual toggle. The stored `notesMode`
// is never mutated by this derivation.
export function effectiveNotesMode(state: GameState): boolean {
  return state.cellSelectionMode ? state.selectedCells.length >= 1 : state.notesMode;
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
