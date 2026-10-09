interface NumberPadProps {
  notesMode: boolean;
  onPlace: (value: number) => void;
  onToggleNote?: (value: number) => void;
  selectedCell: number | null;
  disabledNumbers?: Set<number>;
  layout: 'portrait' | 'landscape';
  buttonSize?: number;
  portraitContainerWidth?: number;
}

export function NumberPad({
  notesMode,
  onPlace,
  onToggleNote,
  selectedCell,
  disabledNumbers = new Set(),
  layout,
  buttonSize,
  portraitContainerWidth,
}: NumberPadProps) {
  const portraitButtonWidth = layout === 'portrait' && portraitContainerWidth
    ? (portraitContainerWidth - 8 * 8) / 9
    : undefined;
  const numberButtons = Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
    const isDisabled = disabledNumbers.has(num);
    const baseClasses = "flex items-center justify-center rounded-md border text-xl font-medium shadow-sm transition-colors";
    const disabledClasses = "cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-40";
    const style = layout === 'landscape' && buttonSize
      ? { width: `${buttonSize}px`, aspectRatio: "1" }
      : layout === 'portrait' && portraitButtonWidth
        ? { width: `${portraitButtonWidth}px` }
        : undefined;
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
        className={`${baseClasses} ${isDisabled ? disabledClasses : 'border-zinc-300 bg-white text-blue-600 hover:bg-zinc-100 shadow-sm'}`}
        style={style}
      >
        {num}
      </button>
    );
  });

  const containerClasses = layout === 'landscape'
    ? "grid grid-cols-3 gap-2"
    : "flex justify-center gap-2";

  return (
    <div
      className={containerClasses}
      role="group"
      aria-label="Number pad"
    >
      {numberButtons}
    </div>
  );
}
