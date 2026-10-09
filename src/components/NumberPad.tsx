interface NumberPadProps {
  notesMode: boolean;
  onPlace: (value: number) => void;
  onToggleNote?: (value: number) => void;
  onErase?: () => void;
  selectedCell: number | null;
  disabledNumbers?: Set<number>;
  layout: 'portrait' | 'landscape';
  buttonSize?: number;
}

export function NumberPad({
  notesMode,
  onPlace,
  onToggleNote,
  onErase,
  selectedCell,
  disabledNumbers = new Set(),
  layout,
  buttonSize,
}: NumberPadProps) {
  const numberButtons = Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
    const isDisabled = disabledNumbers.has(num);
    const baseClasses = "flex items-center justify-center rounded-md border text-xl font-medium shadow-sm transition-colors";
    const enabledClasses = "border-zinc-300 bg-white text-blue-600 hover:bg-zinc-100";
    const disabledClasses = "cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-40";
    const classes = isDisabled ? `${baseClasses} ${disabledClasses}` : `${baseClasses} ${enabledClasses}`;
    const style = layout === 'landscape' && buttonSize ? {
      width: `${buttonSize}px`,
      aspectRatio: "1",
    } : undefined;
    const containerClasses = layout === 'landscape'
      ? ""
      : "h-12 w-12";
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
        className={`${classes} ${containerClasses}`}
        style={style}
      >
        {num}
      </button>
    );
  });

  const containerClasses = layout === 'landscape'
    ? "grid grid-cols-3 gap-2"
    : "flex w-[min(90vw,432px)] justify-center gap-2";
  const isPortrait = layout === 'portrait';

  return (
    <div
      className={containerClasses}
      role="group"
      aria-label="Number pad"
    >
      {numberButtons}
      {isPortrait && onErase && (
        <button
          type="button"
          onClick={onErase}
          className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-300 bg-white text-blue-600 shadow-sm transition-colors hover:bg-zinc-100"
          aria-label="Erase"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 10.8-5.2-5.2a2 2 0 0 0-2.8 0L3 15.8a2 2 0 0 0 0 2.8l5.2 5.2a2 2 0 0 0 2.8 0L20 15.6a2 2 0 0 0 0-2.8Z"/><path d="m15.8 5.2 5.2 5.2"/></svg>
        </button>
      )}
    </div>
  );
}
