const categoryTouchTargets = {
  smallPhone: { min: 36, max: 64 },
  normalPhone: { min: 36, max: 64 },
  largePhone: { min: 48, max: 64 },
  ipadMini: { min: 48, max: 72 },
  ipadAir: { min: 56, max: 72 },
  ipadPro: { min: 56, max: 84 },
  desktop: { min: 56, max: 84 },
};

const categoryMinMap: Record<string, number> = {
  smallPhone: 36,
  normalPhone: 36,
  largePhone: 48,
  ipadMini: 48,
  ipadAir: 56,
  ipadPro: 56,
  desktop: 56,
};

const categoryMaxMap: Record<string, number> = {
  smallPhone: 64,
  normalPhone: 64,
  largePhone: 64,
  ipadMini: 72,
  ipadAir: 72,
  ipadPro: 84,
  desktop: 84,
};

interface NumberPadProps {
  notesMode: boolean;
  onPlace: (value: number) => void;
  onToggleNote?: (value: number) => void;
  selectedCell: number | null;
  disabledNumbers?: Set<number>;
  layout: 'portrait' | 'landscape';
  buttonSize?: number;
  portraitContainerWidth?: number;
  scaleFactor?: number;
  category?: 'smallPhone' | 'normalPhone' | 'largePhone' | 'ipadMini' | 'ipadAir' | 'ipadPro' | 'desktop';
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
  scaleFactor = 1,
  category = 'desktop' as const,
}: NumberPadProps) {
  const touchMin = categoryTouchTargets[category].min;
  const touchMax = categoryTouchTargets[category].max;

  // Portrait: button row matches board width (exact match)
  const portraitButtonWidth = layout === 'portrait' && portraitContainerWidth
    ? (portraitContainerWidth - 8 * 8) / 9
    : undefined;

  // Landscape: 3x3 grid button size
  const landscapeButtonSize = layout === 'landscape' && buttonSize
    ? buttonSize
    : undefined;

  const numberButtons = Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
    const isDisabled = disabledNumbers.has(num);

    // Determine button size based on layout and category constraints
    let finalButtonSize: number | undefined;
    if (layout === 'portrait' && portraitButtonWidth !== undefined) {
      // Portrait: button = boardWidth / 9, clamped to category min/max
      finalButtonSize = Math.max(touchMin, Math.min(touchMax, portraitButtonWidth));
    } else if (landscapeButtonSize !== undefined) {
      // Landscape: clamped to category min/max
      finalButtonSize = Math.max(touchMin, Math.min(touchMax, landscapeButtonSize));
    }

    const baseClasses = "flex items-center justify-center rounded-md border text-xl font-medium shadow-sm transition-colors";
    const disabledClasses = "cursor-not-allowed border-line-faint bg-surface-disabled opacity-40";

    // Scale font by scaleFactor: 16px * scaleFactor, clamped 12–24px
    const scaledFontSize = Math.max(12, Math.min(24, 16 * scaleFactor));

    const style = finalButtonSize
      ? {
          width: `${finalButtonSize}px`,
          height: `${finalButtonSize}px`,
          fontSize: `${scaledFontSize}px`,
        }
      : portraitButtonWidth !== undefined
        ? {
            width: `${portraitButtonWidth}px`,
            height: `${portraitButtonWidth}px`,
            fontSize: `${scaledFontSize}px`,
          }
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
        className={`${baseClasses} ${isDisabled ? disabledClasses : 'border-line bg-surface text-accent hover:bg-surface-hover shadow-sm'}`}
        style={style}
      >
        {num}
      </button>
    );
  });

  const containerClasses = layout === 'landscape'
    ? "grid grid-cols-3 gap-2"
    : "flex justify-center gap-2";

  const containerStyle = layout === 'portrait' && portraitContainerWidth
    ? { width: `${portraitContainerWidth}px` }
    : undefined;

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      role="group"
      aria-label="Number pad"
    >
      {numberButtons}
    </div>
  );
}
