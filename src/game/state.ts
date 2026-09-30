export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type Status = "playing" | "solved";

export interface GameState {
  difficulty: Difficulty | null;
  givens: boolean[];
  solution: number[];
  board: number[];
  notes: number[][];
  selected: number | null;
  notesMode: boolean;
  elapsedMs: number;
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
    selected: null,
    notesMode: false,
    elapsedMs: 0,
    status: "playing",
  };
}
