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
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        notesMode
          ? "border-zinc-800 bg-zinc-800 text-white"
          : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      Notes {notesMode ? "ON" : "OFF"}
    </button>
  );
}

export interface ControlsProps {
  notesMode: boolean;
  onToggleNotesMode: () => void;
  onNewGame: () => void;
}

export function Controls({
  notesMode,
  onToggleNotesMode,
  onNewGame,
}: Omit<ControlsProps, "onErase">) {
  return (
    <div className="flex w-[min(90vw,432px)] items-center justify-center gap-2">
      <NotesToggle notesMode={notesMode} onToggle={onToggleNotesMode} />
      <button
        type="button"
        onClick={onNewGame}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100"
      >
        New Game
      </button>
    </div>
  );
}