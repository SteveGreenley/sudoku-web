interface NumberPadProps {
  notesMode: boolean;
  onPlace: (value: number) => void;
  onToggleNote?: (value: number) => void;
  selectedCell: number | null;
}

export function NumberPad({
  notesMode,
  onPlace,
  onToggleNote,
  selectedCell,
}: NumberPadProps) {
  return (
    <div
      className="flex w-[min(90vw,432px)] justify-center gap-2"
      role="group"
      aria-label="Number pad"
    >
      {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => {
            if (selectedCell === null) return;
            if (notesMode && onToggleNote) {
              onToggleNote(num);
            } else {
              onPlace(num);
            }
          }}
          aria-label={`Place number ${num}`}
          className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-300 bg-white text-xl font-medium text-blue-600 shadow-sm transition-colors hover:bg-zinc-100"
        >
          {num}
        </button>
      ))}
    </div>
  );
}