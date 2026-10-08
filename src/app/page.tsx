"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "@/components/Board";
import { Controls } from "@/components/Controls";

import { Header } from "@/components/Header";
import { NewGameDialog } from "@/components/NewGameDialog";
import { NumberPad } from "@/components/NumberPad";
import { SolvedOverlay } from "@/components/SolvedOverlay";
import {
  addSelectedCells,
  applyNoteToSelection,
  checkWin,
  clearSelection,
  createInitialState,
  discardState,
  effectiveNotesMode,
  erase,
  eraseSelection,
  getDisabledNumbers,
  getLastDifficulty,
  loadState,
  movePrimary,
  place,
  saveLastDifficulty,
  saveState,
  select,
  startGame,
  toggleNote,
  toggleSelectedCell,
  type Difficulty,
  type GameState,
  type StoragePort,
} from "@/game";

const localStoragePort: StoragePort = {
  get: (key: string) => typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null,
  set: (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
};

export default function Page() {
  const [state, setState] = useState<GameState>(createInitialState);
  const inputRef = useRef<HTMLDivElement>(null);
  const boardGestureRef = useRef(false);
  const [showNewGame, setShowNewGame] = useState(false);
  const [isClient, setIsClient] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setIsClient(true); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  // On mount: resume the saved game, or start a fresh one. Every game-starting
  // path (resume, new game, solved-again) sets the state itself, so there is no
  // separate effect reacting to difficulty changes.
  useEffect(() => {
    if (!isClient) return;
    const saved = loadState(localStoragePort);
    if (saved && saved.status === "playing") {
      setState(saved);
      return;
    }
    const last = getLastDifficulty(localStoragePort);
    const id = setTimeout(() => setState(startGame(last ?? "easy")), 0);
    return () => clearTimeout(id);
  }, [isClient]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Apply a pure action to the game state and persist the result.
  const commit = useCallback(
    (fn: (s: GameState) => GameState) => {
      setState((s) => {
        const next = fn(s);
        if (isClient) saveState(next, localStoragePort);
        return next;
      });
    },
    [isClient],
  );

  const onTapCell = useCallback(
    (index: number) =>
      commit((s) => {
        let next = s.cellSelectionMode ? toggleSelectedCell(s, index) : select(s, index);
        // Tapping a placed number re-places it, which auto-erases the number
        // from notes in its row, column, and box. Exiting cell selection by
        // tapping a filled cell shares this path with normal-mode taps; `place`
        // no-ops on givens.
        if (s.board[index] !== 0 && !s.givens[index]) {
          next = place(next, index, s.board[index]);
        }
        return next;
      }),
    [commit],
  );

  const onAddSelected = useCallback(
    (index: number) => commit((s) => addSelectedCells(s, [index])),
    [commit],
  );

  // A board press that releases on the grid fires click on the common
  // ancestor of the down/up targets; suppress it so a drag never clears the batch.
  const onGestureStart = useCallback(() => {
    boardGestureRef.current = false;
  }, []);
  const onGestureEnd = useCallback(() => {
    boardGestureRef.current = true;
  }, []);

  const onErase = useCallback(
    () =>
      commit((s) => {
        if (s.selected === null && !s.cellSelectionMode) return s;
        return s.cellSelectionMode ? eraseSelection(s) : erase(s, s.selected!);
      }),
    [commit],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key;

      // Escape cancels an in-progress multi-cell selection
      if (key === "Escape" && state.cellSelectionMode) {
        e.preventDefault();
        commit((s) => clearSelection(s));
        return;
      }

      // Arrow keys move the selected cell; in cell selection mode they move the
      // primary without collapsing the group (movePrimary).
      if (state.selected !== null && key.startsWith("Arrow")) {
        e.preventDefault();
        commit((s) => {
          const sel = s.selected!;
          const row = Math.floor(sel / 9);
          const col = sel % 9;
          const delta =
            key === "ArrowLeft"
              ? col > 0 ? -1 : 0
              : key === "ArrowRight"
                ? col < 8 ? 1 : 0
                : key === "ArrowUp"
                  ? row > 0 ? -9 : 0
                  : row < 8 ? 9 : 0;
          const cell = sel + delta;
          return s.cellSelectionMode ? movePrimary(s, cell) : select(s, cell);
        });
        return;
      }

      // 1-9 place numbers or notes; in cell selection mode the note toggles
      // across the whole selection
      const digit = parseInt(key, 10);
      if (digit >= 1 && digit <= 9 && state.selected !== null) {
        commit((s) => {
          return s.cellSelectionMode
            ? applyNoteToSelection(s, digit)
            : effectiveNotesMode(s)
              ? toggleNote(s, s.selected!, digit)
              : place(s, s.selected!, digit);
        });
        return;
      }

      // Backspace erases the selected cell, or the whole selection in the mode
      if (key === "Backspace" && state.selected !== null) {
        e.preventDefault();
        commit((s) => {
          return s.cellSelectionMode ? eraseSelection(s) : erase(s, s.selected!);
        });
        return;
      }
    },
    [state.selected, state.cellSelectionMode, commit],
  );

  const padOnPlace = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        commit((s) => place(s, s.selected!, value));
      }
    },
    [state.selected, commit],
  );

  const padOnToggleNote = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        commit((s) => {
          // In cell selection mode the note toggles across every selected cell;
          // placement stays single-cell (padOnPlace) either way.
          return s.cellSelectionMode
            ? applyNoteToSelection(s, value)
            : toggleNote(s, s.selected!, value);
        });
      }
    },
    [state.selected, commit],
  );

  useEffect(() => {
    if (state.status !== "playing" || state.startTime === undefined) {
      return;
    }
    const interval = setInterval(() => {
      setState((s) => {
        if (s.status !== "playing" || s.startTime === undefined) return s;
        const elapsed = Date.now() - s.startTime;
        const next = { ...s, elapsedMs: elapsed };
        const won = checkWin(next);
        if (isClient && won.status === "solved") {
          saveState(won, localStoragePort);
        }
        return won;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [state.status, state.startTime, isClient]);

  const handleNewGamePrompt = useCallback(() => {
    setShowNewGame(true);
  }, []);

  const handleNewGameConfirm = useCallback(
    (d: Difficulty) => {
      setShowNewGame(false);
      if (isClient) {
        discardState(localStoragePort);
      }
      const newGame = startGame(d);
      if (isClient) saveLastDifficulty(d, localStoragePort);
      setState(newGame);
    },
    [isClient],
  );

  const handleSolvedNewGame = useCallback(
    (d: Difficulty) => {
      if (isClient) {
        discardState(localStoragePort);
      }
      const newGame = startGame(d);
      if (isClient) saveLastDifficulty(d, localStoragePort);
      setState(newGame);
    },
    [isClient],
  );

  return (
    <main
      className="flex flex-1 flex-col items-center gap-6 py-10"
      onKeyDown={handleKeyDown}
      onPointerDown={() => {
        boardGestureRef.current = false;
      }}
      onClick={(e) => {
        if (boardGestureRef.current) {
          boardGestureRef.current = false;
          return;
        }
        if (e.target instanceof Element && !e.target.closest("button") && state.cellSelectionMode) {
          commit((s) => clearSelection(s));
        }
      }}
      ref={inputRef}
      tabIndex={-1}
    >
      <Header state={state} />
      <Controls
        notesMode={effectiveNotesMode(state)}
        onToggleNotesMode={() =>
          setState((s) => {
            if (!s.cellSelectionMode) {
              return { ...s, notesMode: !s.notesMode };
            }
            const next = clearSelection(s);
            if (isClient) saveState(next, localStoragePort);
            return next;
          })
        }
        onNewGame={handleNewGamePrompt}
      />
      <Board
        state={state}
        onTapCell={onTapCell}
        onAddSelected={onAddSelected}
        onClearSelection={() => commit(clearSelection)}
        onGestureStart={onGestureStart}
        onGestureEnd={onGestureEnd}
      />
      <NumberPad
        notesMode={effectiveNotesMode(state)}
        onPlace={padOnPlace}
        onToggleNote={padOnToggleNote}
        onErase={onErase}
        selectedCell={state.selected}
        disabledNumbers={getDisabledNumbers(state)}
      />
      {state.status === "solved" && (
        <SolvedOverlay
          elapsedMs={state.elapsedMs}
          difficulty={state.difficulty}
          onNewGame={handleSolvedNewGame}
        />
      )}
      {showNewGame && (
        <NewGameDialog
          onClose={() => setShowNewGame(false)}
          onConfirm={handleNewGameConfirm}
        />
      )}
    </main>
  );
}
