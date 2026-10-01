import { computeHighlights, type GameState } from "@/game";
import { Cell } from "./Cell";

export function Board({
  state,
  onSelectCell,
  onPlace,
}: {
  state: GameState;
  onSelectCell: (cell: number) => void;
  onPlace: (cell: number, value: number) => void;
}) {
  const highlights = computeHighlights(state);

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
          solutionValue={state.solution[index]}
          isGiven={state.givens[index]}
          notes={state.notes[index]}
          isSelected={state.selected === index}
          isHighlighted={highlights?.highlighted.has(index) ?? false}
          isSameNumber={highlights?.bold.has(index) ?? false}
          onSelect={onSelectCell}
          onPlace={onPlace}
        />
      ))}
    </div>
  );
}
