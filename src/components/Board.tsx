import type { GameState } from "@/game";
import { Cell } from "./Cell";

export function Board({
  state,
  onSelectCell,
}: {
  state: GameState;
  onSelectCell: (cell: number) => void;
}) {
  return (
    <div
      className="grid w-[min(90vw,432px)] grid-cols-9 border-l-2 border-t-2 border-zinc-800 shadow-md"
      role="grid"
      aria-label="Sudoku board"
    >
      {state.board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isGiven={state.givens[index]}
          isSelected={state.selected === index}
          onSelect={onSelectCell}
        />
      ))}
    </div>
  );
}
