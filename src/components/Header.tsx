import type { GameState } from "@/game";

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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-1.73 1l-.15.09a2 2 0 0 0-2.66 1l-.15.09a2 2 0 0 0-1 1.73v.44a2 2 0 0 1 1 1.73l.43.25a2 2 0 0 1 1.73 1l.15.09a2 2 0 0 0 2.66-1l.15.09a2 2 0 0 0 1 1.73v.44a2 2 0 0 0 1 1.73l.43.25a2 2 0 0 1 1.73 1l.15.09a2 2 0 0 0 2.66 1l.15.09a2 2 0 0 0 1-1.73v-.44a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 1.73-1l.15-.09a2 2 0 0 0 2.66-1l.15.09a2 2 0 0 0 1-1.73v-.44a2 2 0 0 0-1-1.73l-.43-.25a2 2 0 0 1-1.73-1l-.15-.09a2 2 0 0 0-2.66 1z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
