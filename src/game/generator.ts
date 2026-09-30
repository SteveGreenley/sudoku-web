import { CELLS, SIZE, type Difficulty } from "./state";

export type Rng = () => number;

export interface Puzzle {
  givens: boolean[];
  solution: number[];
}

export const REMOVAL_BUDGET: Record<Difficulty, number> = {
  easy: 43,
  medium: 48,
  hard: 53,
  expert: 57,
};

const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function isValidGrid(grid: number[]): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = grid[row * SIZE + col];
      if (value === 0) continue;
      if (occurrences(grid, row, col, value) > 1) return false;
    }
  }
  return true;
}

function occurrences(grid: number[], row: number, col: number, value: number): number {
  let count = 0;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < SIZE; i++) {
    if (grid[row * SIZE + i] === value) count++;
    if (grid[i * SIZE + col] === value) count++;
  }
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r * SIZE + c] === value) count++;
    }
  }
  return count - 2;
}

export function countSolutions(grid: number[], limit = 2): number {
  const g = [...grid];
  let count = 0;
  const solve = (): void => {
    if (count >= limit) return;
    let best = -1;
    let bestCandidates: number[] = [];
    for (let pos = 0; pos < CELLS; pos++) {
      if (g[pos] !== 0) continue;
      const candidates = candidatesAt(g, pos);
      if (candidates.length === 0) return;
      if (best === -1 || candidates.length < bestCandidates.length) {
        best = pos;
        bestCandidates = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (best === -1) {
      count++;
      return;
    }
    for (const value of bestCandidates) {
      g[best] = value;
      solve();
      g[best] = 0;
      if (count >= limit) return;
    }
  };
  solve();
  return count;
}

function candidatesAt(grid: number[], pos: number): number[] {
  const row = Math.floor(pos / SIZE);
  const col = pos % SIZE;
  const used = new Set<number>();
  for (let i = 0; i < SIZE; i++) {
    used.add(grid[row * SIZE + i]);
    used.add(grid[i * SIZE + col]);
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      used.add(grid[r * SIZE + c]);
    }
  }
  const out: number[] = [];
  for (const value of VALUES) {
    if (!used.has(value)) out.push(value);
  }
  return out;
}

function completeGrid(rng: Rng): number[] {
  const grid = Array<number>(CELLS).fill(0);
  const fill = (pos: number): boolean => {
    if (pos === CELLS) return true;
    const candidates = shuffle(candidatesAt(grid, pos), rng);
    for (const value of candidates) {
      grid[pos] = value;
      if (fill(pos + 1)) return true;
      grid[pos] = 0;
    }
    return false;
  };
  return fill(0) ? grid : Array<number>(CELLS).fill(0);
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generatePuzzle(difficulty: Difficulty, rng: Rng = Math.random): Puzzle {
  const solution = completeGrid(rng);
  const givens = Array<boolean>(CELLS).fill(true);
  const grid = [...solution];
  const order = shuffle(Array.from({ length: CELLS }, (_, i) => i), rng);
  const budget = REMOVAL_BUDGET[difficulty];
  let removed = 0;
  for (const pos of order) {
    if (removed >= budget) break;
    grid[pos] = 0;
    if (countSolutions(grid, 2) === 1) {
      givens[pos] = false;
      removed++;
    } else {
      grid[pos] = solution[pos];
    }
  }
  return { givens, solution };
}
