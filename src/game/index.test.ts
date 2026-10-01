import { describe, expect, it } from "vitest";
import {
  CELLS,
  checkWin,
  computeHighlights,
  countSolutions,
  createInitialState,
  discardState,
  erase,
  generatePuzzle,
  getLastDifficulty,
  isValidGrid,
  loadState,
  place,
  REMOVAL_BUDGET,
  saveLastDifficulty,
  saveState,
  select,
  startGame,
  startGameTimer,
  toggleNote,
  type Difficulty,
  type Rng,
  type StoragePort,
} from "./index";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function puzzleGrid(givens: boolean[], solution: number[]): number[] {
  return solution.map((value, i) => (givens[i] ? value : 0));
}

// A known-complete classic grid (the solution of the classic 17-clue layout).
const KNOWN_SOLUTION = [
  5, 3, 4, 6, 7, 8, 9, 1, 2,
  6, 7, 2, 1, 9, 5, 3, 4, 8,
  1, 9, 8, 3, 4, 2, 5, 6, 7,
  8, 5, 9, 7, 6, 1, 4, 2, 3,
  4, 2, 6, 8, 5, 3, 7, 9, 1,
  7, 1, 3, 9, 2, 4, 8, 5, 6,
  9, 6, 1, 5, 3, 7, 2, 8, 4,
  8, 2, 7, 4, 1, 9, 6, 3, 5,
  3, 4, 5, 2, 8, 6, 1, 7, 9,
];

describe("createInitialState", () => {
  it("returns the full game state shape with an empty board", () => {
    const state = createInitialState();
    expect(state).toEqual({
      difficulty: null,
      givens: Array(CELLS).fill(false),
      solution: Array(CELLS).fill(0),
      board: Array(CELLS).fill(0),
      notes: Array.from({ length: CELLS }, () => []),
      selected: null,
      notesMode: false,
      elapsedMs: 0,
      startTime: undefined,
      status: "playing",
    });
  });

  it("exposes JSON-safe fields so the object serialises as-is", () => {
    const state = createInitialState();
    expect(() => JSON.parse(JSON.stringify(state))).not.toThrow();
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});

describe("select", () => {
  it("sets the selected cell from state in to state out", () => {
    const next = select(createInitialState(), 40);
    expect(next.selected).toBe(40);
    expect(next).not.toBe(createInitialState());
  });

  it("leaves state unchanged for an out-of-range cell", () => {
    const state = createInitialState();
    expect(select(state, CELLS)).toBe(state);
    expect(select(state, -1)).toBe(state);
  });
});

describe("place", () => {
  it("sets the value and clears the cell's own notes", () => {
    const state = {
      ...createInitialState(),
      board: withCell(40, 7),
      notes: withNotes(40, [7, 8]),
    };
    const next = place(state, 40, 9);
    expect(next.board[40]).toBe(9);
    expect(next.notes[40]).toEqual([]);
    // untouched elsewhere
    expect(next.board[41]).toBe(0);
    expect(next.notes[41]).toEqual([]);
  });

  it("never touches a given", () => {
    const state = createInitialState();
    state.givens[5] = true;
    state.board[5] = 3;
    expect(place(state, 5, 9)).toBe(state);
  });

  it("ignores out-of-range cells and values outside 1-9", () => {
    const state = createInitialState();
    expect(place(state, CELLS, 1)).toBe(state);
    expect(place(state, 0, 0)).toBe(state);
    expect(place(state, 0, 10)).toBe(state);
  });
});

describe("toggleNote", () => {
  it("adds then removes a note on an empty cell", () => {
    const state = createInitialState();
    const added = toggleNote(state, 12, 5);
    expect(added.notes[12]).toEqual([5]);
    expect(toggleNote(added, 12, 5).notes[12]).toEqual([]);
  });

  it("keeps notes sorted", () => {
    const state = createInitialState();
    const next = toggleNote(toggleNote(state, 12, 7), 12, 3);
    expect(next.notes[12]).toEqual([3, 7]);
  });

  it("does nothing on a cell holding a number or a given", () => {
    const filled = createInitialState();
    filled.board[12] = 4;
    expect(toggleNote(filled, 12, 5)).toBe(filled);
    const given = createInitialState();
    given.givens[12] = true;
    expect(toggleNote(given, 12, 5)).toBe(given);
  });
});

describe("erase", () => {
  it("clears a number on a cell holding one", () => {
    const state = { ...createInitialState(), board: withCell(12, 4) };
    const next = erase(state, 12);
    expect(next.board[12]).toBe(0);
  });

  it("clears notes on an empty cell", () => {
    const state = { ...createInitialState(), notes: withNotes(12, [2, 4]) };
    const next = erase(state, 12);
    expect(next.board[12]).toBe(0);
    expect(next.notes[12]).toEqual([]);
  });

  it("never touches a given", () => {
    const state = createInitialState();
    state.givens[12] = true;
    state.board[12] = 4;
    expect(erase(state, 12)).toBe(state);
  });
});

describe("computeHighlights", () => {
  it("returns null when no cell is selected", () => {
    expect(computeHighlights(createInitialState())).toBeNull();
  });

  it("highlights the row, column, and box of the selected cell", () => {
    const state = createInitialState();
    const result = computeHighlights(select(state, 40));
    const { highlighted } = result!;
    const row = Math.floor(40 / 9);
    const col = 40 % 9;
    for (let i = 0; i < CELLS; i++) {
      if (i === 40) {
        expect(highlighted.has(i)).toBe(false);
        continue;
      }
      const r = Math.floor(i / 9);
      const c = i % 9;
      const inSameRow = r === row;
      const inSameCol = c === col;
      const inSameBox =
        Math.floor(r / 3) === Math.floor(row / 3) &&
        Math.floor(c / 3) === Math.floor(col / 3);
      expect(highlighted.has(i)).toBe(inSameRow || inSameCol || inSameBox);
    }
  });

  it("bolds other cells holding the same number as selected", () => {
    const state = startGame("medium", seededRng(1));
    const selected = 5;
    const selectedValue = state.board[selected];
    const result = computeHighlights(select(state, selected));
    const { bold } = result!;
    for (let i = 0; i < CELLS; i++) {
      if (i === selected) {
        expect(bold.has(i)).toBe(false);
        continue;
      }
      const shouldBold = state.board[i] === selectedValue && selectedValue !== 0;
      expect(bold.has(i)).toBe(shouldBold);
    }
  });

  it("produces no bolding when selected cell has no number (notes-only)", () => {
    const state = startGame("medium", seededRng(1));
    const emptyCell = state.board.findIndex((v) => v === 0);
    expect(state.board[emptyCell]).toBe(0);
    const result = computeHighlights(select(state, emptyCell));
    expect(result!.bold.size).toBe(0);
  });
});

describe("countSolutions", () => {
  it("counts one solution for a complete valid grid", () => {
    expect(countSolutions(KNOWN_SOLUTION, 2)).toBe(1);
  });

  it("stops counting at the limit for a grid with many solutions", () => {
    expect(countSolutions(Array(CELLS).fill(0), 2)).toBe(2);
  });
});

describe("generatePuzzle", () => {
  it("returns a complete valid solution and a valid partial grid of givens", () => {
    for (const difficulty of DIFFICULTIES) {
      const { givens, solution } = generatePuzzle(difficulty, seededRng(1));
      expect(solution.every((v) => v >= 1 && v <= 9)).toBe(true);
      expect(isValidGrid(solution)).toBe(true);
      expect(isValidGrid(puzzleGrid(givens, solution))).toBe(true);
    }
  });

  it("produces a puzzle with exactly one solution", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      for (const difficulty of DIFFICULTIES) {
        const { givens, solution } = generatePuzzle(difficulty, seededRng(seed));
        expect(countSolutions(puzzleGrid(givens, solution), 2)).toBe(1);
      }
    }
  });

  it("uses a per-difficulty removal budget: easy removes the fewest, expert the most", () => {
    const removals = (difficulty: Difficulty) =>
      generatePuzzle(difficulty, seededRng(42)).givens.filter((g) => !g).length;
    const counts = DIFFICULTIES.map(removals);
    // budgets strictly increase with difficulty
    const budgets = DIFFICULTIES.map((d) => REMOVAL_BUDGET[d]);
    for (let i = 1; i < budgets.length; i++) {
      expect(budgets[i]).toBeGreaterThan(budgets[i - 1]);
    }
    // generated removals never exceed the budget
    DIFFICULTIES.forEach((d, i) => {
      expect(counts[i]).toBeLessThanOrEqual(REMOVAL_BUDGET[d]);
    });
    // every difficulty leaves a real puzzle, and same seed keeps removals monotone
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
      expect(counts[i]).toBeGreaterThanOrEqual(30);
    }
  });

  it("is deterministic for a given seed and varies across seeds", () => {
    const a = generatePuzzle("hard", seededRng(7));
    const b = generatePuzzle("hard", seededRng(7));
    const c = generatePuzzle("hard", seededRng(8));
    expect(a).toEqual(b);
    expect(a.solution).not.toEqual(c.solution);
  });
});

describe("startGameTimer", () => {
  it("sets startTime on first call", () => {
    const state = createInitialState();
    expect(state.startTime).toBeUndefined();
    const next = startGameTimer(state);
    expect(next.startTime).toBeDefined();
  });

  it("does not modify state if game already started", () => {
    const state = startGameTimer(createInitialState());
    const next = startGameTimer(state);
    expect(next).toBe(state);
  });

  it("does not modify state if game is solved", () => {
    const solvedState = { ...createInitialState(), status: "solved" as const };
    const next = startGameTimer(solvedState);
    expect(next).toBe(solvedState);
  });
});

describe("checkWin", () => {
  it("sets status to solved when board equals solution", () => {
    const state = startGame("medium", seededRng(7));
    const completeState = {
      ...state,
      board: [...state.solution],
    };
    const next = checkWin(completeState);
    expect(next.status).toBe("solved");
  });

  it("does not win when board has a mistake", () => {
    const state = startGame("medium", seededRng(7));
    const incompleteBoard = [...state.solution];
    incompleteBoard[5] = (state.solution[5] % 9) + 1;
    const incompleteState = {
      ...state,
      board: incompleteBoard,
    };
    const next = checkWin(incompleteState);
    expect(next.status).toBe("playing");
  });

  it("does not win when board is incomplete", () => {
    const state = startGame("medium", seededRng(7));
    const partialState = { ...state };
    const next = checkWin(partialState);
    expect(next.status).toBe("playing");
  });

  it("does not modify state if game is already solved", () => {
    const solvedState = { ...createInitialState(), status: "solved" as const };
    const next = checkWin(solvedState);
    expect(next).toBe(solvedState);
  });
});

describe("startGame", () => {
  it("starts a playing game at the chosen difficulty", () => {
    const state = startGame("hard", seededRng(7));
    expect(state.difficulty).toBe("hard");
    expect(state.status).toBe("playing");
    expect(state.elapsedMs).toBe(0);
    expect(state.startTime).toBeUndefined();
    expect(state.selected).toBeNull();
    expect(state.notesMode).toBe(false);
  });

  it("pre-fills the board with the givens and leaves other cells empty", () => {
    const state = startGame("medium", seededRng(11));
    state.givens.forEach((isGiven, i) => {
      expect(state.board[i]).toBe(isGiven ? state.solution[i] : 0);
    });
    expect(state.board.some((v) => v === 0)).toBe(true);
  });

  it("carries the full solution in state", () => {
    const state = startGame("expert", seededRng(13));
    expect(state.solution.every((v) => v >= 1 && v <= 9)).toBe(true);
    expect(isValidGrid(state.solution)).toBe(true);
    const { givens } = generatePuzzle("expert", seededRng(13));
    expect(state.givens).toEqual(givens);
    expect(countSolutions(state.board, 2)).toBe(1);
  });

  it("generates a fresh puzzle per seed", () => {
    const a = startGame("easy", seededRng(21));
    const b = startGame("easy", seededRng(22));
    expect(a.board).not.toEqual(b.board);
  });

  it("stays JSON-safe", () => {
    const state = startGame("hard", seededRng(23));
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});

function withCell(index: number, value: number): number[] {
  const arr = Array(CELLS).fill(0) as number[];
  arr[index] = value;
  return arr;
}

function withNotes(index: number, notes: number[]): number[][] {
  return Array.from({ length: CELLS }, (_, i) =>
    i === index ? [...notes] : [],
  );
}

function makeMemoryStorage(): StoragePort {
  const store: Record<string, string> = {};
  return {
    get(key: string) {
      return store[key] ?? null;
    },
    set(key: string, value: string) {
      store[key] = value;
    },
  };
}

describe("save / restore round-trip with in-memory storage", () => {
  it("saves and restores the full game state", () => {
    const storage = makeMemoryStorage();
    const game = startGame("hard", seededRng(7));
    saveState(game, storage);
    const restored = loadState(storage);
    expect(restored).toEqual(game);
  });

  it("restores an in-progress game with elapsed time and notes", () => {
    const storage = makeMemoryStorage();
    let game = startGame("medium", seededRng(11));
    game = select(game, 5);
    game = place(game, 5, 3);
    game = place(game, 12, 7);
    game = toggleNote(game, 20, 4);
    saveState(game, storage);
    const restored = loadState(storage);
    expect(restored).toEqual(game);
  });

  it("returns null when no state has been saved", () => {
    const storage = makeMemoryStorage();
    expect(loadState(storage)).toBeNull();
  });

  it("returns null when stored data is corrupted", () => {
    const storage = makeMemoryStorage();
    storage.set("sudoku_state", "invalid json {{{");
    expect(loadState(storage)).toBeNull();
  });

  it("discards state from storage", () => {
    const storage = makeMemoryStorage();
    const game = startGame("easy", seededRng(1));
    saveState(game, storage);
    expect(loadState(storage)).not.toBeNull();
    discardState(storage);
    expect(loadState(storage)).toBeNull();
  });

  it("saves and retrieves last difficulty", () => {
    const storage = makeMemoryStorage();
    saveLastDifficulty("expert", storage);
    expect(getLastDifficulty(storage)).toBe("expert");
  });

  it("returns null for last difficulty when not set", () => {
    const storage = makeMemoryStorage();
    expect(getLastDifficulty(storage)).toBeNull();
  });
});
