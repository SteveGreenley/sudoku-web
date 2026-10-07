import { describe, expect, it } from "vitest";
import {
  CELLS,
  addSelectedCells,
  applyNoteToSelection,
  clearSelection,
  createInitialState,
  effectiveNotesMode,
  eraseSelection,
  loadState,
  movePrimary,
  place,
  saveState,
  select,
  startGame,
  toggleSelectedCell,
  type GameState,
  type Rng,
  type StoragePort,
} from "./index";

function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

// Build a state carrying a particular multi-selection, keeping the invariant
// that `selected` is the last member of the set.
function withSelection(
  base: GameState,
  cells: number[],
): GameState {
  return {
    ...base,
    selectedCells: [...cells],
    selected: cells.length > 0 ? cells[cells.length - 1] : null,
    cellSelectionMode: cells.length >= 2,
  };
}

// A fresh board (no givens, all empty) so every cell is incompleted.
function emptyBoard(): GameState {
  return createInitialState();
}

function withGiven(state: GameState, cell: number): GameState {
  const givens = [...state.givens];
  const board = [...state.board];
  givens[cell] = true;
  board[cell] = 3;
  return { ...state, givens, board };
}

function withNumber(state: GameState, cell: number, value: number): GameState {
  const board = [...state.board];
  const notes = state.notes.map((n) => [...n]);
  board[cell] = value;
  notes[cell] = [];
  return { ...state, board, notes };
}

describe("GameState defaults (multi-cell selection)", () => {
  it("defaults selectedCells to empty and cellSelectionMode to off in a fresh state", () => {
    const state = createInitialState();
    expect(state.selectedCells).toEqual([]);
    expect(state.cellSelectionMode).toBe(false);
  });

  it("defaults selectedCells to empty and cellSelectionMode to off in a fresh game", () => {
    const state = startGame("medium", seededRng(3));
    expect(state.selectedCells).toEqual([]);
    expect(state.cellSelectionMode).toBe(false);
    expect(state.selected).toBeNull();
  });
});

describe("select (single-cell, normal mode)", () => {
  it("mirrors the selected cell into the set and turns cell-selection off", () => {
    const next = select(emptyBoard(), 40);
    expect(next.selected).toBe(40);
    expect(next.selectedCells).toEqual([40]);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("still selects a given cell (normal mode may target any cell)", () => {
    const state = withGiven(emptyBoard(), 5);
    const next = select(state, 5);
    expect(next.selected).toBe(5);
    expect(next.selectedCells).toEqual([5]);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("leaves state unchanged for an out-of-range cell", () => {
    const state = emptyBoard();
    expect(select(state, CELLS)).toBe(state);
    expect(select(state, -1)).toBe(state);
  });

  it("resets a multi-selection back to a single-cell normal selection", () => {
    const multi = withSelection(emptyBoard(), [10, 20, 30]);
    const next = select(multi, 20);
    expect(next.selected).toBe(20);
    expect(next.selectedCells).toEqual([20]);
    expect(next.cellSelectionMode).toBe(false);
  });
});

describe("addSelectedCells", () => {
  it("adds several incompleted cells, sets the last as primary, and turns the mode on", () => {
    const next = addSelectedCells(emptyBoard(), [10, 20, 30]);
    expect(next.selectedCells).toEqual([10, 20, 30]);
    expect(next.selected).toBe(30);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("adds a single cell without turning the mode on", () => {
    const next = addSelectedCells(emptyBoard(), [10]);
    expect(next.selectedCells).toEqual([10]);
    expect(next.selected).toBe(10);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("skips givens and completed cells", () => {
    const state = withGiven(withNumber(emptyBoard(), 20, 5), 10);
    const next = addSelectedCells(state, [10, 20, 30]);
    expect(next.selectedCells).toEqual([30]);
    expect(next.selected).toBe(30);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("skips out-of-range cells", () => {
    const next = addSelectedCells(emptyBoard(), [10, CELLS, -1, 30]);
    expect(next.selectedCells).toEqual([10, 30]);
    expect(next.selected).toBe(30);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("dedupes repeated cells in the input", () => {
    const next = addSelectedCells(emptyBoard(), [10, 10, 20]);
    expect(next.selectedCells).toEqual([10, 20]);
    expect(next.selected).toBe(20);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("appends to an existing selection and dedupes against it", () => {
    const base = withSelection(emptyBoard(), [5]);
    const next = addSelectedCells(base, [5, 10, 15]);
    expect(next.selectedCells).toEqual([5, 10, 15]);
    expect(next.selected).toBe(15);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("is a no-op when every cell is rejected or already selected", () => {
    const state = withSelection(withGiven(emptyBoard(), 10), [10]);
    const rejected = addSelectedCells(state, [10, 20, 30]);
    // 10 is a given (rejected), 20/30 are incompleted and not selected -> added
    // Use a fully-rejected input instead:
    const state2 = withSelection(withGiven(emptyBoard(), 10), [10]);
    const noNew = addSelectedCells(state2, [10]);
    expect(noNew).toBe(state2);
    void rejected;
  });
});

describe("toggleSelectedCell", () => {
  it("adds an incompleted cell that is not yet selected", () => {
    const next = toggleSelectedCell(emptyBoard(), 10);
    expect(next.selectedCells).toEqual([10]);
    expect(next.selected).toBe(10);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("turns the mode on once a second cell is added", () => {
    const next = toggleSelectedCell(toggleSelectedCell(emptyBoard(), 10), 20);
    expect(next.selectedCells).toEqual([10, 20]);
    expect(next.selected).toBe(20);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("removes a non-primary member and keeps the primary", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    const next = toggleSelectedCell(base, 10);
    expect(next.selectedCells).toEqual([20]);
    expect(next.selected).toBe(20);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("removes the primary and re-points to the new last member", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    const next = toggleSelectedCell(base, 30);
    expect(next.selectedCells).toEqual([10, 20]);
    expect(next.selected).toBe(20);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("emptying the last cell clears the primary and the mode", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    const after = toggleSelectedCell(base, 20);
    const next = toggleSelectedCell(after, 10);
    expect(next.selectedCells).toEqual([]);
    expect(next.selected).toBeNull();
    expect(next.cellSelectionMode).toBe(false);
  });

  it("is a no-op for a given cell that is not selected", () => {
    const state = withGiven(emptyBoard(), 5);
    expect(toggleSelectedCell(state, 5)).toBe(state);
  });

  it("is a no-op for a completed cell that is not selected", () => {
    const state = withNumber(emptyBoard(), 5, 7);
    expect(toggleSelectedCell(state, 5)).toBe(state);
  });

  it("is a no-op for an out-of-range cell", () => {
    const state = emptyBoard();
    expect(toggleSelectedCell(state, CELLS)).toBe(state);
  });
});

describe("applyNoteToSelection", () => {
  it("adds the note to every selected cell at once", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    const next = applyNoteToSelection(base, 5);
    expect(next.notes[10]).toEqual([5]);
    expect(next.notes[20]).toEqual([5]);
    expect(next.notes[30]).toEqual([5]);
  });

  it("removes it from a cell that already has it while adding it to the others, in one call", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    base.notes[10] = [5];
    const next = applyNoteToSelection(base, 5);
    expect(next.notes[10]).toEqual([]);
    expect(next.notes[20]).toEqual([5]);
  });

  it("keeps notes sorted", () => {
    const base = withSelection(emptyBoard(), [10]);
    base.notes[10] = [3, 7];
    const next = applyNoteToSelection(base, 5);
    expect(next.notes[10]).toEqual([3, 5, 7]);
  });

  it("leaves cells outside the selection untouched", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    const next = applyNoteToSelection(base, 5);
    expect(next.notes[11]).toEqual([]);
    expect(next.notes[40]).toEqual([]);
  });

  it("does not change the selection membership, the primary, or the mode", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    const next = applyNoteToSelection(base, 5);
    expect(next.selectedCells).toEqual([10, 20, 30]);
    expect(next.selected).toBe(30);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("skips given and completed cells defensively", () => {
    const state = withNumber(withGiven(emptyBoard(), 10), 20, 7);
    const base = withSelection(state, [10, 20, 30]);
    const next = applyNoteToSelection(base, 5);
    expect(next.givens[10]).toBe(true);
    expect(next.board[20]).toBe(7);
    expect(next.notes[30]).toEqual([5]);
  });

  it("is a no-op when the selection is empty", () => {
    const state = emptyBoard();
    expect(applyNoteToSelection(state, 5)).toBe(state);
  });

  it("is a no-op for an invalid value", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    expect(applyNoteToSelection(base, 0)).toBe(base);
    expect(applyNoteToSelection(base, 10)).toBe(base);
    expect(applyNoteToSelection(base, 2.5)).toBe(base);
  });

  it("leaves the stored notesMode untouched", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    base.notesMode = true;
    const next = applyNoteToSelection(base, 5);
    expect(next.notesMode).toBe(true);
  });

  it("is a no-op when the game is not playing", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    const solved = { ...base, status: "solved" as const };
    expect(applyNoteToSelection(solved, 5)).toBe(solved);
  });
});

describe("eraseSelection", () => {
  it("clears the notes on every selected cell at once", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    base.notes[10] = [2, 5];
    base.notes[20] = [4];
    base.notes[30] = [1, 3, 7];
    const next = eraseSelection(base);
    expect(next.notes[10]).toEqual([]);
    expect(next.notes[20]).toEqual([]);
    expect(next.notes[30]).toEqual([]);
  });

  it("leaves cells outside the selection untouched", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    base.notes[11] = [2, 5];
    const next = eraseSelection(base);
    expect(next.notes[11]).toEqual([2, 5]);
  });

  it("does not change the selection membership, the primary, or the mode", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    base.notes[10] = [2];
    const next = eraseSelection(base);
    expect(next.selectedCells).toEqual([10, 20, 30]);
    expect(next.selected).toBe(30);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("clears a number from a member that holds one, mirroring erase", () => {
    const state = withNumber(emptyBoard(), 20, 7);
    const base = withSelection(state, [10, 20, 30]);
    base.notes[10] = [2];
    const next = eraseSelection(base);
    expect(next.board[20]).toBe(0);
    expect(next.notes[10]).toEqual([]);
  });

  it("skips given cells defensively", () => {
    const state = withGiven(emptyBoard(), 10);
    const base = withSelection(state, [10, 20]);
    const next = eraseSelection(base);
    expect(next.board[10]).toBe(3);
    expect(next.givens[10]).toBe(true);
  });

  it("is a no-op when the selection is empty", () => {
    const state = emptyBoard();
    expect(eraseSelection(state)).toBe(state);
  });

  it("is a no-op when no selected cell has a number or notes", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    expect(eraseSelection(base)).toBe(base);
  });

  it("is a no-op when the game is not playing", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    base.notes[10] = [2];
    const solved = { ...base, status: "solved" as const };
    expect(eraseSelection(solved)).toBe(solved);
  });
});

describe("movePrimary", () => {
  it("moves the primary to an incompleted cell and adds it to the set as the last element", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    const next = movePrimary(base, 30);
    expect(next.selected).toBe(30);
    expect(next.selectedCells).toEqual([10, 20, 30]);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("does not duplicate a cell that is already a member", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    const next = movePrimary(base, 10);
    expect(next.selected).toBe(10);
    expect(next.selectedCells).toEqual([10, 20]);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("takes a given cell as the primary without adding it to the set", () => {
    const state = withGiven(emptyBoard(), 5);
    const base = withSelection(state, [10, 20]);
    const next = movePrimary(base, 5);
    expect(next.selected).toBe(5);
    expect(next.selectedCells).toEqual([10, 20]);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("takes a completed cell as the primary without adding it to the set", () => {
    const state = withNumber(emptyBoard(), 5, 7);
    const base = withSelection(state, [10, 20]);
    const next = movePrimary(base, 5);
    expect(next.selected).toBe(5);
    expect(next.selectedCells).toEqual([10, 20]);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("never shrinks the set or exits the mode", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    const next = movePrimary(base, 10);
    expect(next.selectedCells.length).toBe(3);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("turns the mode on once the move grows the set to two cells", () => {
    const base = withSelection(emptyBoard(), [10]);
    const next = movePrimary(base, 20);
    expect(next.selected).toBe(20);
    expect(next.selectedCells).toEqual([10, 20]);
    expect(next.cellSelectionMode).toBe(true);
  });

  it("keeps the mode off for a single-member set that stays single", () => {
    const base = withSelection(emptyBoard(), [10]);
    const next = movePrimary(base, 10);
    expect(next.selected).toBe(10);
    expect(next.selectedCells).toEqual([10]);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("is a no-op for an out-of-range cell", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    expect(movePrimary(base, CELLS)).toBe(base);
    expect(movePrimary(base, -1)).toBe(base);
  });

  it("is a no-op when the game is not playing", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    const solved = { ...base, status: "solved" as const };
    expect(movePrimary(solved, 30)).toBe(solved);
  });
});

describe("clearSelection", () => {
  it("empties the set, clears the primary, and turns the mode off", () => {
    const base = withSelection(emptyBoard(), [10, 20, 30]);
    const next = clearSelection(base);
    expect(next.selectedCells).toEqual([]);
    expect(next.selected).toBeNull();
    expect(next.cellSelectionMode).toBe(false);
  });

  it("leaves the stored notesMode untouched", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    base.notesMode = true;
    const next = clearSelection(base);
    expect(next.notesMode).toBe(true);
  });

  it("is a no-op when there is nothing to clear", () => {
    const state = emptyBoard();
    expect(clearSelection(state)).toBe(state);
  });
});

describe("effectiveNotesMode", () => {
  it("equals the stored notesMode in normal mode", () => {
    const off = emptyBoard();
    off.notesMode = false;
    expect(effectiveNotesMode(off)).toBe(false);
    const on = emptyBoard();
    on.notesMode = true;
    expect(effectiveNotesMode(on)).toBe(true);
  });

  it("is on whenever any cell is selected in cell-selection mode", () => {
    const two = withSelection(emptyBoard(), [10, 20]);
    expect(effectiveNotesMode(two)).toBe(true);
    const one = withSelection(emptyBoard(), [10]);
    one.cellSelectionMode = true; // flag says "in the mode"
    expect(effectiveNotesMode(one)).toBe(true);
  });

  it("is off in cell-selection mode when the set is empty", () => {
    const empty = emptyBoard();
    empty.cellSelectionMode = true;
    empty.selectedCells = [];
    expect(effectiveNotesMode(empty)).toBe(false);
  });
});

describe("place (drops completed cells from the selection)", () => {
  it("drops the placed cell from the set but keeps the primary where it was", () => {
    const base = withSelection(emptyBoard(), [10, 20]);
    base.notes[20] = [];
    const next = place(base, 20, 5);
    expect(next.board[20]).toBe(5);
    expect(next.selectedCells).toEqual([10]);
    expect(next.selected).toBe(20); // unchanged: place is not a selection action
    expect(next.cellSelectionMode).toBe(false);
  });

  it("does not touch the set or the primary when placing elsewhere", () => {
    const base = withSelection(emptyBoard(), [10]);
    const next = place(base, 40, 3);
    expect(next.selectedCells).toEqual([10]);
    expect(next.selected).toBe(10);
    expect(next.cellSelectionMode).toBe(false);
  });

  it("keeps the primary after placing on it in normal single-cell mode", () => {
    const base = withSelection(emptyBoard(), [10]);
    const next = place(base, 10, 3);
    expect(next.board[10]).toBe(3);
    expect(next.selectedCells).toEqual([]);
    expect(next.selected).toBe(10); // preserved: no behaviour change for single-cell play
    expect(next.cellSelectionMode).toBe(false);
  });
});

describe("save / load round-trip for the selection", () => {
  it("round-trips selectedCells, the primary, and the mode flag", () => {
    const storage = makeMemoryStorage();
    const game = withSelection(startGame("medium", seededRng(11)), [10, 20, 30]);
    game.notesMode = true;
    saveState(game, storage);
    const restored = loadState(storage);
    expect(restored).toEqual(game);
    expect(restored!.selectedCells).toEqual([10, 20, 30]);
    expect(restored!.selected).toBe(30);
    expect(restored!.cellSelectionMode).toBe(true);
    expect(restored!.notesMode).toBe(true);
  });

  it("round-trips an empty selection with the mode off", () => {
    const storage = makeMemoryStorage();
    const game = startGame("easy", seededRng(1));
    saveState(game, storage);
    const restored = loadState(storage);
    expect(restored!.selectedCells).toEqual([]);
    expect(restored!.cellSelectionMode).toBe(false);
    expect(restored!.selected).toBeNull();
  });
});

describe("invariants across selection actions", () => {
  it("keeps `selected` equal to the last member of the set after every selection action", () => {
    let state = emptyBoard();
    state = addSelectedCells(state, [10, 20, 30]);
    expect(state.selected).toBe(state.selectedCells[state.selectedCells.length - 1]);
    state = toggleSelectedCell(state, 30);
    expect(state.selected).toBe(state.selectedCells[state.selectedCells.length - 1]);
    state = toggleSelectedCell(state, 10);
    expect(state.selected).toBe(state.selectedCells[state.selectedCells.length - 1]);
    state = select(state, 5);
    expect(state.selected).toBe(state.selectedCells[state.selectedCells.length - 1]);
    state = clearSelection(state);
    expect(state.selected).toBeNull();
    expect(state.selectedCells).toEqual([]);
  });

  it("keeps `selected` equal to the last member after movePrimary onto an incompleted cell", () => {
    const state = movePrimary(withSelection(emptyBoard(), [10, 20]), 30);
    expect(state.selected).toBe(state.selectedCells[state.selectedCells.length - 1]);
  });

  it("keeps only incompleted cells in the set for the batch actions", () => {
    const state = withGiven(withNumber(emptyBoard(), 20, 5), 10);
    const next = addSelectedCells(state, [10, 20, 30, 40]);
    for (const cell of next.selectedCells) {
      expect(next.givens[cell]).toBe(false);
      expect(next.board[cell]).toBe(0);
    }
    expect(next.selectedCells).toEqual([30, 40]);
  });

  it("derives the mode flag purely from the set size", () => {
    let state = emptyBoard();
    state = addSelectedCells(state, [10]);
    expect(state.cellSelectionMode).toBe(false);
    state = addSelectedCells(state, [20]);
    expect(state.cellSelectionMode).toBe(true);
    state = toggleSelectedCell(state, 20);
    expect(state.cellSelectionMode).toBe(false);
  });
});
