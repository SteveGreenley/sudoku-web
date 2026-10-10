import { useCallback } from "react";
import type { Difficulty } from "@/game";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface SolvedOverlayProps {
  elapsedMs: number;
  difficulty: Difficulty | null;
  onNewGame: (difficulty: Difficulty) => void;
}

export function SolvedOverlay({
  elapsedMs,
  difficulty,
  onNewGame,
}: SolvedOverlayProps) {
  const onSelectDifficulty = useCallback(
    (d: Difficulty) => () => onNewGame(d),
    [onNewGame],
  );

  const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white p-8 text-center shadow-xl">
        <h2 className="mb-2 text-3xl font-bold text-text-strong">Solved!</h2>
        {difficulty && (
          <p className="mb-4 text-lg text-text-soft">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
        )}
        <p className="mb-6 font-mono text-2xl text-accent">
          {formatElapsed(elapsedMs)}
        </p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={onSelectDifficulty(d)}
              className="rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-text-muted shadow-sm transition-colors hover:bg-surface-hover"
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}