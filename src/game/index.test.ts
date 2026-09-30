import { describe, expect, it } from "vitest";
import {
  CELLS,
  createInitialState,
  erase,
  place,
  select,
  toggleNote,
} from "./index";

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
