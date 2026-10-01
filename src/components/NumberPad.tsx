interface NumberPadProps {
  notesMode: boolean;
  onPlace: (value: number) => void;
  onToggleNote?: (value: number) => void;
  onErase?: () => void;
  selectedCell: number | null;
  disabledNumbers?: Set<number>;
}

export function NumberPad({
  notesMode,
  onPlace,
  onToggleNote,
  onErase,
  selectedCell,
  disabledNumbers = new Set(),
}: NumberPadProps) {
  const numberButtons = Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
    const isDisabled = disabledNumbers.has(num);
    const baseClasses = "flex h-12 w-12 items-center justify-center rounded-md border text-xl font-medium shadow-sm transition-colors";
    const enabledClasses = "border-zinc-300 bg-white text-blue-600 hover:bg-zinc-100";
    const disabledClasses = "cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-40";
    const classes = isDisabled ? `${baseClasses} ${disabledClasses}` : `${baseClasses} ${enabledClasses}`;
    return (
      <button
        key={num}
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (selectedCell === null) return;
          if (notesMode && onToggleNote) {
            onToggleNote(num);
          } else {
            onPlace(num);
          }
        }}
        aria-label={`Place number ${num}`}
        className={classes}
      >
        {num}
      </button>
    );
  });

  return (
    <div
      className="flex w-[min(90vw,432px)] justify-center gap-2"
      role="group"
      aria-label="Number pad"
    >
      {numberButtons}
      {onErase && (
        <button
          type="button"
          onClick={onErase}
          className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-300 bg-white text-blue-600 shadow-sm transition-colors hover:bg-zinc-100 text-xl"
          aria-label="Erase"
        >
          ⌫
        </button>
      )}
    </div>
  );
}