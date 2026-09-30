"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/Board";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { Header } from "@/components/Header";
import {
  createInitialState,
  select,
  startGame,
  type Difficulty,
  type GameState,
} from "@/game";

export default function Page() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  useEffect(() => {
    const id = setTimeout(() => setState(startGame(difficulty)), 0);
    return () => clearTimeout(id);
  }, [difficulty]);

  const onSelectCell = (cell: number) => setState((s) => select(s, cell));

  return (
    <main className="flex flex-1 flex-col items-center gap-6 py-10">
      <Header state={state} />
      <DifficultyPicker value={difficulty} onSelect={setDifficulty} />
      <Board state={state} onSelectCell={onSelectCell} />
    </main>
  );
}
