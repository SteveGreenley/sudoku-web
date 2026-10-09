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
          ? "border-zinc-800 bg-zinc-800 text-white"
          : "border-zinc-300 bg-white text-blue-600 hover:bg-zinc-100"
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
      <NotesToggle notesMode={notesMode} onToggle={onToggleNotesMode} />
      <button
        type="button"
        onClick={onUndo}
        disabled={isDisabled}
        className={`rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium shadow-sm transition-colors ${
          isDisabled
            ? "text-zinc-400 opacity-40 cursor-not-allowed"
            : "text-blue-600 hover:bg-zinc-100"
        }`}
        aria-label="Undo"
      >
            <Undo2 size={20} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onNewGame}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100"
        aria-label="New Game"
      >
        <Play size={20} strokeWidth={2} />
      </button>
      {onErase && (
        <button
          type="button"
          onClick={onErase}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-zinc-100"
          aria-label="Erase"
        >
          <Eraser size={20} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
