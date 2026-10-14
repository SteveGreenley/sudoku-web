import { NotebookPen, Play, Undo2, Eraser } from "lucide-react";

interface NotesToggleProps {
  notesMode: boolean;
  onToggle: () => void;
  scaleFactor?: number;
}

export function NotesToggle({ notesMode, onToggle, scaleFactor = 1 }: NotesToggleProps) {
  // Scale padding: base 6px (py-1.5) * scaleFactor, clamped 4–10px
  const scaledPaddingY = Math.max(4, Math.min(10, 6 * scaleFactor));
  // Scale horizontal padding: base 12px (px-3) * scaleFactor, clamped 8–16px
  const scaledPaddingX = Math.max(8, Math.min(16, 12 * scaleFactor));
  // Scale icon: base 20 * scaleFactor, clamped 14–28
  const scaledIconSize = Math.max(14, Math.min(28, 20 * scaleFactor));

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={notesMode}
      title={notesMode ? "Notes ON" : "Notes OFF"}
      className={`rounded-md border transition-colors ${
        notesMode
          ? "border-ink bg-ink text-inverse"
          : "border-line bg-surface text-accent hover:bg-surface-hover"
      }`}
      style={{
        paddingLeft: `${scaledPaddingX}px`,
        paddingRight: `${scaledPaddingX}px`,
        paddingTop: `${scaledPaddingY}px`,
        paddingBottom: `${scaledPaddingY}px`,
      }}
    >
      <NotebookPen size={scaledIconSize} strokeWidth={2} />
    </button>
  );
}

export interface ControlsProps {
  notesMode: boolean;
  onToggleNotesMode: () => void;
  onUndo: () => void;
  onNewGame: () => void;
  onErase?: () => void;
  maxWidth?: number;
  historyLength: number;
  scaleFactor?: number;
}

export function Controls({
  notesMode,
  onToggleNotesMode,
  onUndo,
  onNewGame,
  onErase,
  maxWidth,
  historyLength,
  scaleFactor = 1,
}: ControlsProps) {
  const isDisabled = historyLength === 0;

  // Scale font: 14px (text-sm) * scaleFactor, clamped 11–20px
  const scaledFontSize = Math.max(11, Math.min(20, 14 * scaleFactor));
  // Scale icon: 20 * scaleFactor, clamped 14–28
  const scaledIconSize = Math.max(14, Math.min(28, 20 * scaleFactor));
  // Scale gap: 8px (gap-2) * scaleFactor, clamped 4–16
  const scaledGap = Math.max(4, Math.min(16, 8 * scaleFactor));
  // Scale padding: 8px (px-2) * scaleFactor, clamped 4–12
  const scaledPaddingX = Math.max(4, Math.min(12, 8 * scaleFactor));
  // Scale padding: 6px (py-1.5) * scaleFactor, clamped 4–10
  const scaledPaddingY = Math.max(4, Math.min(10, 6 * scaleFactor));

  return (
    <div className="flex items-center justify-center" style={{ gap: `${scaledGap}px`, maxWidth: maxWidth ? `${maxWidth}px` : "min(90vw, 432px)" }}>
      <button
        type="button"
        onClick={onNewGame}
        className="rounded-md border border-line bg-surface text-accent shadow-sm transition-colors hover:bg-surface-hover"
        aria-label="New Game"
        style={{
          fontSize: `${scaledFontSize}px`,
          paddingLeft: `${scaledPaddingX}px`,
          paddingRight: `${scaledPaddingX}px`,
          paddingTop: `${scaledPaddingY}px`,
          paddingBottom: `${scaledPaddingY}px`,
        }}
      >
        <Play size={scaledIconSize} strokeWidth={2} />
      </button>
      <NotesToggle notesMode={notesMode} onToggle={onToggleNotesMode} scaleFactor={scaleFactor} />
      <button
        type="button"
        onClick={onUndo}
        disabled={isDisabled}
        className={`rounded-md border border-line bg-surface text-accent shadow-sm transition-colors hover:bg-surface-hover ${
          isDisabled
            ? "text-text-faint opacity-40 cursor-not-allowed"
            : ""
        }`}
        aria-label="Undo"
        style={{
          fontSize: `${scaledFontSize}px`,
          paddingLeft: `${scaledPaddingX}px`,
          paddingRight: `${scaledPaddingX}px`,
          paddingTop: `${scaledPaddingY}px`,
          paddingBottom: `${scaledPaddingY}px`,
        }}
      >
            <Undo2 size={scaledIconSize} strokeWidth={2} />
      </button>
      {onErase && (
        <button
          type="button"
          onClick={onErase}
          className="rounded-md border border-line bg-surface text-accent shadow-sm transition-colors hover:bg-surface-hover"
          aria-label="Erase"
          style={{
            fontSize: `${scaledFontSize}px`,
            paddingLeft: `${scaledPaddingX}px`,
            paddingRight: `${scaledPaddingX}px`,
            paddingTop: `${scaledPaddingY}px`,
            paddingBottom: `${scaledPaddingY}px`,
          }}
        >
          <Eraser size={scaledIconSize} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
