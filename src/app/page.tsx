"use client";

import { useState } from "react";
import { Board } from "@/components/Board";
import { Header } from "@/components/Header";
import { createInitialState, select, type GameState } from "@/game";

export default function Page() {
  const [state, setState] = useState<GameState>(createInitialState);
  const onSelectCell = (cell: number) => setState((s) => select(s, cell));

  return (
    <main className="flex flex-1 flex-col items-center gap-6 py-10">
      <Header state={state} />
      <Board state={state} onSelectCell={onSelectCell} />
    </main>
  );
}
