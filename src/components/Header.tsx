import type { GameState } from "@/game";
import { Settings } from "lucide-react";

interface HeaderProps {
  state: GameState;
  width?: number;
  onOpenSettings?: () => void;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function Header({ state, width, onOpenSettings }: HeaderProps) {
  return (
    <header className={`flex items-baseline justify-between ${width ? "" : "w-[min(90vw,432px)]"}`} style={width ? { width: `${width}px` } : undefined}>
      <h1 className="text-2xl font-bold tracking-tight">Sudoku</h1>
      <div className="flex items-baseline gap-4 text-sm">
        <span className="font-medium text-text-soft">
          {state.difficulty ? capitalize(state.difficulty) : "—"}
        </span>
        <span className="font-mono tabular-nums">{formatElapsed(state.elapsedMs)}</span>
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-text-muted hover:text-text-soft"
            aria-label="Settings"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
