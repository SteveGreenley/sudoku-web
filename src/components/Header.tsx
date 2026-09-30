import type { GameState } from "@/game";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function Header({ state }: { state: GameState }) {
  return (
    <header className="flex w-[min(90vw,432px)] items-baseline justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Sudoku</h1>
      <div className="flex items-baseline gap-4 text-sm">
        <span className="font-medium text-zinc-500">
          {state.difficulty ? capitalize(state.difficulty) : "—"}
        </span>
        <span className="font-mono tabular-nums">{formatElapsed(state.elapsedMs)}</span>
      </div>
    </header>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
