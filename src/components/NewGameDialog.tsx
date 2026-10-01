import { useState, useCallback } from "react";
import type { Difficulty } from "@/game";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

interface NewGameDialogProps {
  onConfirm: (selected: Difficulty) => void;
}

export function NewGameDialog({ onConfirm }: NewGameDialogProps) {
  const [step, setStep] = useState<"confirm" | "difficulty">("confirm");
  const [chosen, setChosen] = useState<Difficulty | null>(null);

  const handleCancel = useCallback(() => {
    setStep("confirm");
  }, []);

  const handleConfirm = useCallback(() => {
    setStep("difficulty");
  }, []);

  const handleSelectDifficulty = useCallback(
    (d: Difficulty) => {
      setChosen(d);
      onConfirm(d);
    },
    [onConfirm],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white p-8 shadow-xl">
        {step === "confirm" ? (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">
              Start New Game?
            </h2>
            <p className="mb-6 text-zinc-600">
              Your current game will be lost.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-md border border-zinc-300 bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700"
              >
                New Game
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-zinc-900">
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
                      ? "border-zinc-800 bg-zinc-800 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
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
