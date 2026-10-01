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
  discardState,
  erase,
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
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
};

function getInitial(): GameState {
  const saved = loadState(localStoragePort);
  if (saved && saved.status === "playing") {
    return saved;
  }
  const last = getLastDifficulty(localStoragePort);
  return startGame(last ?? "easy");
}

export default function Page() {
  const [state, setState] = useState<GameState>(getInitial);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = loadState(localStoragePort);
    if (saved && saved.difficulty) return saved.difficulty;
    return getLastDifficulty(localStoragePort) ?? "easy";
  });
  const inputRef = useRef<HTMLDivElement>(null);
  const [showNewGame, setShowNewGame] = useState(false);

  const onSelectCell = useCallback(
    (cell: number) => setState((s) => select(s, cell)),
    [],
  );

  const onPlace = useCallback(
    (cell: number, value: number) => {
      setState((s) => {
        const next = place(s, cell, value);
        saveState(next, localStoragePort);
        return next;
      });
    },
    [],
  );

  const onErase = useCallback(
    () => setState((s) => {
      if (s.selected === null) return s;
      const next = erase(s, s.selected);
      saveState(next, localStoragePort);
      return next;
    }),
    [],
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
          saveState(next, localStoragePort);
          return next;
        });
        return;
      }

      // Backspace erases the selected cell
      if (key === "Backspace" && state.selected !== null) {
        e.preventDefault();
        setState((s) => {
          const next = erase(s, s.selected!);
          saveState(next, localStoragePort);
          return next;
        });
        return;
      }
    },
    [state.selected, state.notesMode],
  );

  const padOnPlace = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        setState((s) => {
          const next = place(s, s.selected!, value);
          saveState(next, localStoragePort);
          return next;
        });
      }
    },
    [state.selected],
  );

  const padOnToggleNote = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        setState((s) => {
          const next = toggleNote(s, s.selected!, value);
          saveState(next, localStoragePort);
          return next;
        });
      }
    },
    [state.selected],
  );

  useEffect(() => {
    if (state.status !== "playing" || state.elapsedMs === 0 || state.startTime === undefined) {
      return;
    }
    const interval = setInterval(() => {
      setState((s) => {
        if (s.status !== "playing" || s.elapsedMs === 0 || s.startTime === undefined) return s;
        const elapsed = Date.now() - s.startTime;
        const next = { ...s, elapsedMs: elapsed };
        const won = checkWin(next);
        if (won.status === "solved") {
          saveState(won, localStoragePort);
        }
        return won;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [state.status, state.elapsedMs, state.startTime]);

  const handleNewGamePrompt = useCallback(() => {
    setShowNewGame(true);
  }, []);

  const handleNewGameConfirm = useCallback(
    (d: Difficulty) => {
      setShowNewGame(false);
      discardState(localStoragePort);
      const newGame = startGame(d);
      setDifficulty(d);
      saveLastDifficulty(d, localStoragePort);
      setState(newGame);
    },
    [],
  );

  const handleSolvedNewGame = useCallback(
    (d: Difficulty) => {
      discardState(localStoragePort);
      const newGame = startGame(d);
      setDifficulty(d);
      saveLastDifficulty(d, localStoragePort);
      setState(newGame);
    },
    [],
  );

  return (
    <main
      className="flex flex-1 flex-col items-center gap-6 py-10"
      onKeyDown={handleKeyDown}
      ref={inputRef}
      tabIndex={-1}
    >
      <Header state={state} />
      <DifficultyPicker value={difficulty} onSelect={setDifficulty} />
      <Controls
        notesMode={state.notesMode}
        onToggleNotesMode={() => setState((s) => ({ ...s, notesMode: !s.notesMode }))}
        onErase={onErase}
        onNewGame={handleNewGamePrompt}
      />
      <Board state={state} onSelectCell={onSelectCell} onPlace={onPlace} />
      <NumberPad
        notesMode={state.notesMode}
        onPlace={padOnPlace}
        onToggleNote={padOnToggleNote}
        selectedCell={state.selected}
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
          onConfirm={handleNewGameConfirm}
        />
      )}
    </main>
  );
}
