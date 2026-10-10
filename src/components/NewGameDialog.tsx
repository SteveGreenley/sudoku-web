import { useState, useCallback } from "react";
import type { Difficulty } from "@/game";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

interface NewGameDialogProps {
  onClose: () => void;
  onConfirm: (selected: Difficulty) => void;
}

export function NewGameDialog({ onClose, onConfirm }: NewGameDialogProps) {
  const [step, setStep] = useState<"confirm" | "difficulty">("confirm");
  const [chosen, setChosen] = useState<Difficulty | null>(null);

  const handleConfirmStep = useCallback(() => {
    setStep("difficulty");
  }, []);

  const handleSelectDifficulty = useCallback(
    (d: Difficulty) => {
      setChosen(d);
      onClose();
      onConfirm(d);
    },
    [onClose, onConfirm],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-surface p-8 shadow-xl">
        {step === "confirm" ? (
          <div>
            <h2 className="mb-4 font-heading text-2xl font-bold text-text-strong">
              Start New Game?
            </h2>
            <p className="mb-6 text-text-soft">
              Your current game will be lost.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-text-muted shadow-sm transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStep}
                className="rounded-md border border-ink bg-ink px-4 py-2 text-sm font-medium text-inverse shadow-sm transition-colors hover:bg-ink-hover"
              >
                New Game
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-4 font-heading text-2xl font-bold text-text-strong">
              Choose Difficulty
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDifficulty(d)}
                  className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                    chosen === d
                      ? "border-ink bg-ink text-inverse"
                      : "border-line bg-surface text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
