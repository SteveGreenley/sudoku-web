import { NotebookPen, Play, Undo2, Eraser } from "lucide-react";

interface NotesToggleProps {
  notesMode: boolean;
  onToggle: () => void;
}

export function NotesToggle({ notesMode, onToggle }: NotesToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={notesMode}
      title={notesMode ? "Notes ON" : "Notes OFF"}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        notesMode
          ? "border-ink bg-ink text-inverse"
          : "border-line bg-surface text-accent hover:bg-surface-hover"
      }`}
    >
      <NotebookPen size={20} strokeWidth={2} />
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
}

export function Controls({
  notesMode,
  onToggleNotesMode,
  onUndo,
  onNewGame,
  onErase,
  maxWidth,
  historyLength,
}: ControlsProps) {
  const isDisabled = historyLength === 0;
  return (
    <div className="flex items-center justify-center gap-2" style={maxWidth ? { maxWidth: `${maxWidth}px` } : { width: "min(90vw, 432px)" }}>
      <button
        type="button"
        onClick={onNewGame}
        className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm font-medium text-accent shadow-sm transition-colors hover:bg-surface-hover"
        aria-label="New Game"
      >
        <Play size={20} strokeWidth={2} />
      </button>
      <NotesToggle notesMode={notesMode} onToggle={onToggleNotesMode} />
      <button
        type="button"
        onClick={onUndo}
        disabled={isDisabled}
        className={`rounded-md border border-line bg-surface px-2 py-1.5 text-sm font-medium shadow-sm transition-colors ${
          isDisabled
            ? "text-text-faint opacity-40 cursor-not-allowed"
            : "text-accent hover:bg-surface-hover"
        }`}
        aria-label="Undo"
      >
            <Undo2 size={20} strokeWidth={2} />
      </button>
      {onErase && (
        <button
          type="button"
          onClick={onErase}
          className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm font-medium text-accent shadow-sm transition-colors hover:bg-surface-hover"
          aria-label="Erase"
        >
          <Eraser size={20} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
