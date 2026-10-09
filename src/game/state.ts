export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type Status = "playing" | "solved";

export interface Snapshot {
  board: number[];
  notes: number[][];
}

export interface GameState {
  difficulty: Difficulty | null;
  givens: boolean[];
  solution: number[];
  board: number[];
  notes: number[][];
  history: Snapshot[];
  selected: number | null;
  selectedCells: number[];
  cellSelectionMode: boolean;
  notesMode: boolean;
  elapsedMs: number;
  startTime: number | undefined;
  status: Status;
}

export const SIZE = 9;
export const CELLS = SIZE * SIZE;

export function createInitialState(): GameState {
  return {
    difficulty: null,
    givens: Array(CELLS).fill(false),
    solution: Array(CELLS).fill(0),
    board: Array(CELLS).fill(0),
    notes: Array.from({ length: CELLS }, () => []),
    history: [],
    selected: null,
    selectedCells: [],
    cellSelectionMode: false,
    notesMode: false,
    elapsedMs: 0,
    startTime: undefined,
    status: "playing",
  };
}
