import type { Difficulty } from "@/game";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

export function DifficultyPicker({
  value,
  onSelect,
}: {
  value: Difficulty | null;
  onSelect: (difficulty: Difficulty) => void;
}) {
  return (
    <div
      className="flex w-[min(90vw,432px)] overflow-hidden rounded-md border border-zinc-300 text-sm shadow-sm"
      role="group"
      aria-label="Difficulty"
    >
      {DIFFICULTIES.map((difficulty) => (
        <button
          key={difficulty}
          type="button"
          onClick={() => onSelect(difficulty)}
          aria-pressed={value === difficulty}
          className={`flex-1 px-1 py-1.5 capitalize transition-colors ${
            value === difficulty
              ? "bg-zinc-800 font-medium text-white"
              : "bg-white text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          {difficulty}
        </button>
      ))}
    </div>
  );
}
