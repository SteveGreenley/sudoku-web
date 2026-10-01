"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "@/components/Board";
import { Controls } from "@/components/Controls";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { Header } from "@/components/Header";
import { NewGameDialog } from "@/components/NewGameDialog";
import { NumberPad } from "@/components/NumberPad";
import { SolvedOverlay } from "@/components/SolvedOverlay";
import {
  checkWin,
  createInitialState,
  discardState,
  erase,
  getDisabledNumbers,
  getLastDifficulty,
  loadState,
  place,
  saveLastDifficulty,
  saveState,
  select,
  startGame,
  toggleNote,
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
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const inputRef = useRef<HTMLDivElement>(null);
  const [showNewGame, setShowNewGame] = useState(false);
  const [isClient, setIsClient] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setIsClient(true); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Track if state was loaded from persistence (to prevent new game startup)
  const loadedFromPersistence = useRef(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  // On mount: try loading a saved game, or start a new one
  useEffect(() => {
    if (!isClient) return;
    const saved = loadState(localStoragePort);
    if (saved && saved.status === "playing") {
      loadedFromPersistence.current = true;
      setState(saved);
      if (saved.difficulty) {
        setDifficulty(saved.difficulty);
      }
      return;
    }
    loadedFromPersistence.current = false;
    const last = getLastDifficulty(localStoragePort);
    const initDifficulty = last ?? "easy";
    setDifficulty(initDifficulty);
    const id = setTimeout(() => setState(startGame(initDifficulty)), 0);
    return () => clearTimeout(id);
  }, [isClient]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // When difficulty prop changes (via UI), start a new game with new difficulty
  const prevDifficultyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isClient || prevDifficultyRef.current === null) {
      prevDifficultyRef.current = difficulty;
      return;
    }
    // Only start a new game if difficulty actually changed
    if (prevDifficultyRef.current === difficulty) return;
    prevDifficultyRef.current = difficulty;
    const id = setTimeout(() => setState(startGame(difficulty)), 0);
    return () => clearTimeout(id);
  }, [isClient, difficulty]);



  const onSelectCell = useCallback(
    (cell: number) => setState((s) => select(s, cell)),
    [],
  );

  const onPlace = useCallback(
    (cell: number, value: number) => {
      setState((s) => {
        const next = place(s, cell, value);
        if (isClient) saveState(next, localStoragePort);
        return next;
      });
    },
    [isClient],
  );

  const onErase = useCallback(
    () => setState((s) => {
      if (s.selected === null) return s;
      const next = erase(s, s.selected);
      if (isClient) saveState(next, localStoragePort);
      return next;
    }),
    [isClient],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key;

      // Arrow keys move selection
      if (state.selected !== null) {
        if (key === "ArrowLeft") {
          e.preventDefault();
          const col = state.selected % 9;
          const newCol = Math.max(0, col - 1);
          setState((s) => select(s, s.selected! + (newCol - col)));
          return;
        }
        if (key === "ArrowRight") {
          e.preventDefault();
          const col = state.selected % 9;
          const newCol = Math.min(8, col + 1);
          setState((s) => select(s, s.selected! + (newCol - col)));
          return;
        }
        if (key === "ArrowUp") {
          e.preventDefault();
          const row = Math.floor(state.selected / 9);
          const newRow = Math.max(0, row - 1);
          setState((s) => select(s, s.selected! + (newRow - row) * 9));
          return;
        }
        if (key === "ArrowDown") {
          e.preventDefault();
          const row = Math.floor(state.selected / 9);
          const newRow = Math.min(8, row + 1);
          setState((s) => select(s, s.selected! + (newRow - row) * 9));
          return;
        }
      }

      // 1-9 place numbers or notes
      const digit = parseInt(key, 10);
      if (digit >= 1 && digit <= 9 && state.selected !== null) {
        setState((s) => {
          const next = state.notesMode
            ? toggleNote(s, s.selected!, digit)
            : place(s, s.selected!, digit);
          if (isClient) saveState(next, localStoragePort);
          return next;
        });
        return;
      }

      // Backspace erases the selected cell
      if (key === "Backspace" && state.selected !== null) {
        e.preventDefault();
        setState((s) => {
          const next = erase(s, s.selected!);
          if (isClient) saveState(next, localStoragePort);
          return next;
        });
        return;
      }
    },
    [state.selected, state.notesMode, isClient],
  );

  const padOnPlace = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        setState((s) => {
          const next = place(s, s.selected!, value);
          if (isClient) saveState(next, localStoragePort);
          return next;
        });
      }
    },
    [state.selected, isClient],
  );

  const padOnToggleNote = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        setState((s) => {
          const next = toggleNote(s, s.selected!, value);
          if (isClient) saveState(next, localStoragePort);
          return next;
        });
      }
    },
    [state.selected, isClient],
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
      setDifficulty(d);
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
      setDifficulty(d);
      if (isClient) saveLastDifficulty(d, localStoragePort);
      setState(newGame);
    },
    [isClient],
  );

  return (
    <main
      className="flex flex-1 flex-col items-center gap-6 py-10"
      onKeyDown={handleKeyDown}
      ref={inputRef}
      tabIndex={-1}
    >
      <Header state={state} />
      <DifficultyPicker value={isClient ? difficulty : state.difficulty ?? "easy"} onSelect={setDifficulty} />
      <Controls
        notesMode={state.notesMode}
        onToggleNotesMode={() => setState((s) => ({ ...s, notesMode: !s.notesMode }))}
        onNewGame={handleNewGamePrompt}
      />
      <Board state={state} onSelectCell={onSelectCell} onPlace={onPlace} />
      <NumberPad
        notesMode={state.notesMode}
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
