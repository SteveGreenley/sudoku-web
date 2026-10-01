"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Board } from "@/components/Board";
import { Controls } from "@/components/Controls";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { Header } from "@/components/Header";
import { NumberPad } from "@/components/NumberPad";
import { SolvedOverlay } from "@/components/SolvedOverlay";
import {
  checkWin,
  createInitialState,
  erase,
  place,
  select,
  startGame,
  toggleNote,
  type Difficulty,
  type GameState,
} from "@/game";

export default function Page() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setState(startGame(difficulty)), 0);
    return () => clearTimeout(id);
  }, [difficulty]);

  const onSelectCell = useCallback(
    (cell: number) => setState((s) => select(s, cell)),
    [],
  );

  const onPlace = useCallback(
    (cell: number, value: number) => setState((s) => place(s, cell, value)),
    [],
  );

  const onErase = useCallback(
    () => setState((s) => (s.selected !== null ? erase(s, s.selected) : s)),
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
        if (state.notesMode) {
          setState((s) => toggleNote(s, s.selected!, digit));
        } else {
          setState((s) => place(s, s.selected!, digit));
        }
        return;
      }

      // Backspace erases the selected cell
      if (key === "Backspace" && state.selected !== null) {
        e.preventDefault();
        setState((s) => erase(s, s.selected!));
        return;
      }
    },
    [state.selected, state.notesMode],
  );

  const padOnPlace = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        setState((s) => place(s, s.selected!, value));
      }
    },
    [state.selected],
  );

  const padOnToggleNote = useCallback(
    (value: number) => {
      if (state.selected !== null) {
        setState((s) => toggleNote(s, s.selected!, value));
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
        return checkWin(next);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [state.status, state.elapsedMs, state.startTime]);

  const handleNewGame = useCallback(
    (d: Difficulty) => {
      setDifficulty(d);
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
          onNewGame={handleNewGame}
        />
      )}
    </main>
  );
}