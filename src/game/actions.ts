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

function recordSnapshot(state: GameState): GameState {
  return {
    ...state,
    history: [
      ...state.history,
      { board: [...state.board], notes: state.notes.map((n) => [...n]) },
    ],
    board: [...state.board],
    notes: state.notes.map((n) => [...n]),
    selectedCells: [...state.selectedCells],
  };
}

function contentEquals(a: GameState, b: GameState): boolean {
  for (let i = 0; i < CELLS; i++) {
    if (a.board[i] !== b.board[i]) return false;
  }
  for (let i = 0; i < CELLS; i++) {
    const an = a.notes[i];
    const bn = b.notes[i];
    if (an.length !== bn.length) return false;
    for (let j = 0; j < an.length; j++) {
      if (an[j] !== bn[j]) return false;
    }
  }
  return true;
}

export function undo(state: GameState): GameState {
  if (state.status !== "playing" || state.history.length === 0) return state;
  const snapshot = state.history[state.history.length - 1];
  return {
    ...state,
    board: [...snapshot.board],
    notes: snapshot.notes.map((n) => [...n]),
    history: state.history.slice(0, -1),
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
  return { ...state, startTime: Date.now() };
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
  // Tap same value again: clear the cell (reverse a mistake or undo a placement).
  if (state.board[cell] === value) {
    const next = recordSnapshot(startGameTimer(state));
    next.board[cell] = 0;
    return contentEquals(state, next) ? state : next;
  }
  const next = recordSnapshot(startGameTimer(state));
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
  next.cellSelectionMode = transitionFlag(state.cellSelectionMode, next.selectedCells.length);
  const final = checkWin(next);
  return contentEquals(state, final) ? state : final;
}

export function toggleNote(state: GameState, cell: number, value: number): GameState {
  if (!validCell(cell) || !validValue(value)) return state;
  if (state.givens[cell] || state.board[cell] !== 0) return state;
  const disabled = getDisabledNumbers(state);
  if (disabled.has(value)) return state;
  const next = recordSnapshot(startGameTimer(state));
  toggleNoteOnCell(next, cell, value);
  return contentEquals(state, next) ? state : next;
}

export function erase(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  if (state.givens[cell]) return state;
  if (state.board[cell] === 0 && state.notes[cell].length === 0) return state;
  const next = recordSnapshot(startGameTimer(state));
  eraseCell(next, cell);
  return contentEquals(state, next) ? state : next;
}

// A cell is "incompleted" when it is not a given and holds no number. Only
// incompleted cells may enter the multi-cell selection.
function isIncompleted(state: GameState, cell: number): boolean {
  return !state.givens[cell] && state.board[cell] === 0;
}

// The cell-selection mode flag after a selection action with a set of the given
// size. It turns on the first time the set reaches two cells and falls only
// when the set becomes empty; trimming a set to one cell keeps the mode on
// (notes stay on, the one cell stays marked).
function transitionFlag(prev: boolean, size: number): boolean {
  return size === 0 ? false : prev || size >= 2;
}

// Per-cell note toggle shared by `toggleNote` and `applyNoteToSelection`: adds
// `value` if the cell does not have it, removes it if it does, keeping the
// notes sorted. Mutates the caller-owned copy; a no-op for givens and
// completed cells.
function toggleNoteOnCell(state: GameState, cell: number, value: number): void {
  if (state.givens[cell] || state.board[cell] !== 0) return;
  const notes = state.notes[cell];
  state.notes[cell] = notes.includes(value)
    ? notes.filter((n) => n !== value)
    : [...notes, value].sort((a, b) => a - b);
}

// Per-cell erase shared by `erase` and `eraseSelection`: clears the number on a
// cell holding one, otherwise clears its notes. Mutates the caller-owned copy;
// a no-op for givens.
function eraseCell(state: GameState, cell: number): void {
  if (state.givens[cell]) return;
  if (state.board[cell] !== 0) {
    state.board[cell] = 0;
  } else {
    state.notes[cell] = [];
  }
}

// Toggles `value` on the notes of every cell in the multi-selection in a single
// action: a cell with the note loses it, a cell without it gains it. Given and
// completed cells in the set are skipped. Selection membership, the primary, and
// the mode flag are untouched — changing a cell's notes never changes who is
// selected. No-op when the set is empty or `value` is invalid.
export function applyNoteToSelection(state: GameState, value: number): GameState {
  if (state.status !== "playing") return state;
  if (!validValue(value) || state.selectedCells.length === 0) return state;
  const next = recordSnapshot(startGameTimer(state));
  for (const cell of next.selectedCells) {
    toggleNoteOnCell(next, cell, value);
  }
  return contentEquals(state, next) ? state : next;
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
  const next = recordSnapshot(startGameTimer(state));
  for (const cell of next.selectedCells) {
    eraseCell(next, cell);
  }
  return contentEquals(state, next) ? state : next;
}

// Appends every valid, incompleted cell that is not already selected, in order.
// A cell that is a given, completed, out of range, or already in the set is
// skipped. When starting a fresh batch from normal mode, the sweep starts with
// the cells from `select()` (which mirrored the single-cell selection into
// `selectedCells`) and prunes non-incompleted cells from it — a single-select
// may have mirrored a filled cell, which gets pruned. In cell selection mode
// the pre-existing batch is kept as-is. The primary `selected` becomes the
// last cell added and the mode flag follows the set-size transition (on from
// two cells, off at zero). Returns the input state untouched when nothing
// was added.
export function addSelectedCells(state: GameState, cells: number[]): GameState {
  if (state.status !== "playing") return state;
  const set = state.cellSelectionMode
    ? [...state.selectedCells]
    : state.selectedCells.filter((i) => isIncompleted(state, i));
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
  next.cellSelectionMode = transitionFlag(state.cellSelectionMode, set.length);
  return next;
}

// Toggles a single cell in the set: removes it if present, otherwise adds it if
// it is incompleted. A tapped filled number (placed or given) cannot join the
// batch: in cell selection it exits the mode and single-selects that cell,
// exactly like a normal-mode tap; outside the mode it stays a no-op. The primary
// `selected` tracks the last member of the set (or null when it empties) and the
// mode flag follows the set-size transition (on from two cells, off at zero).
export function toggleSelectedCell(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  if (state.status !== "playing") return state;
  const next = copy(state);
  if (next.selectedCells.includes(cell)) {
    next.selectedCells = next.selectedCells.filter((i) => i !== cell);
  } else if (state.cellSelectionMode && state.board[cell] !== 0) {
    return select(state, cell);
  } else if (isIncompleted(state, cell)) {
    next.selectedCells.push(cell);
  } else {
    return state;
  }
  next.selected =
    next.selectedCells.length > 0 ? next.selectedCells[next.selectedCells.length - 1] : null;
  next.cellSelectionMode = transitionFlag(state.cellSelectionMode, next.selectedCells.length);
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
// cell selection mode. The set is never grown: if `cell` is already a member it
// is re-pointed to as the last element, otherwise it is taken as the primary
// alone (a cosmetic exception — the UI marks only actual set members). The set
// and the mode flag are otherwise untouched, so navigation keeps the batch
// exactly as the user built it.
export function movePrimary(state: GameState, cell: number): GameState {
  if (!validCell(cell)) return state;
  if (state.status !== "playing") return state;
  const next = copy(state);
  next.selected = cell;
  if (next.selectedCells.includes(cell)) {
    next.selectedCells = [...next.selectedCells.filter((i) => i !== cell), cell];
  }
  next.cellSelectionMode = transitionFlag(state.cellSelectionMode, next.selectedCells.length);
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

// Parses the saved state and merges it over the current defaults, so a save
// written before a field existed (e.g. the multi-cell selection fields) is
// back-filled on load. Returns null when nothing is stored or it is corrupt.
export function loadState(storage: StoragePort): GameState | null {
  try {
    const raw = storage.get(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<GameState>;
    return { ...createInitialState(), ...saved };
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
