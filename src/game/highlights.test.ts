import { describe, expect, it } from "vitest";
import { createInitialState, getDisabledNumbers, place, startGame, toggleNote, type Rng } from "./index";

function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function withBoard(state: ReturnType<typeof createInitialState>, cell: number, value: number): ReturnType<
  typeof createInitialState
> {
  const board = [...state.board];
  board[cell] = value;
  return { ...state, board };
}

describe("getDisabledNumbers", () => {
  it("returns an empty set when no number reaches 9 occurrences", () => {
    const state = createInitialState();
    expect(getDisabledNumbers(state).size).toBe(0);
  });

  it("returns 9 when all 9 instances of a number are placed", () => {
    let state = createInitialState();
    for (let cell = 0; cell < 81; cell++) {
      state = withBoard(state, cell, 5);
    }
    expect(getDisabledNumbers(state).has(5)).toBe(true);
  });

  it("returns different numbers when multiple reach 9 occurrences", () => {
    let state = createInitialState();
    for (let cell = 0; cell < 81; cell++) {
      const v = (cell % 3) + 1; // 1, 2, or 3
      state = withBoard(state, cell, v);
    }
    const disabled = getDisabledNumbers(state);
    expect(disabled.has(1)).toBe(true);
    expect(disabled.has(2)).toBe(true);
    expect(disabled.has(3)).toBe(true);
    expect(disabled.has(4)).toBe(false);
  });
});

describe("place respects disabled numbers", () => {
  it("ignores placing a number when all 9 instances are already on the board", () => {
    let state = startGame("easy", seededRng(1));
    // Fill 9 cells with 7
    const cells = [0, 9, 18, 27, 36, 45, 54, 63, 72];
    for (const cell of cells) {
      state = place(state, cell, 7);
    }
    // Now try to place 7 on another empty cell
    const before = place(state, 1, 7);
    expect(before).toBe(state); // no-op: 7 is disabled
  });
});

describe("toggleNote respects disabled numbers", () => {
  it("ignores adding a note when all 9 instances of that number are on the board", () => {
    let state = startGame("easy", seededRng(1));
    // Fill 9 cells with 3
    const cells = [0, 9, 18, 27, 36, 45, 54, 63, 72];
    for (const cell of cells) {
      state = place(state, cell, 3);
    }
    // Now try to note 3 on an empty cell (find one that isn't already filled)
    const emptyCell = state.board.findIndex((v) => v === 0);
    expect(emptyCell).toBeGreaterThanOrEqual(0);
    const before = toggleNote(state, emptyCell, 3);
    expect(before).toBe(state); // no-op: 3 is disabled
  });

  it("still allows noting other numbers when some numbers are disabled", () => {
    let state = startGame("easy", seededRng(1));
    // Fill 9 cells with 3
    const cells = [0, 9, 18, 27, 36, 45, 54, 63, 72];
    for (const cell of cells) {
      state = place(state, cell, 3);
    }
    // Find a cell that is currently empty and not 3
    const emptyCell = state.board.findIndex((v) => v === 0);
    // Note 5 on an empty cell should still work
    const after = toggleNote(state, emptyCell, 5);
    expect(after.notes[emptyCell]).toEqual([5]);
  });
});
