import { SIZE } from "@/game";

interface CellProps {
  index: number;
  value: number;
  isGiven: boolean;
  isSelected: boolean;
  onSelect: (cell: number) => void;
}

export function Cell({ index, value, isGiven, isSelected, onSelect }: CellProps) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const right =
    col === 2 || col === 5 || col === 8
      ? "border-r-2 border-r-zinc-800"
      : "border-r border-r-zinc-300";
  const bottom =
    row === 2 || row === 5 || row === 8
      ? "border-b-2 border-b-zinc-800"
      : "border-b border-b-zinc-300";
  const fill = isSelected ? "bg-blue-200" : "bg-white hover:bg-zinc-100";
  const text = isGiven ? "font-semibold text-zinc-900" : "text-blue-600";

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Row ${row + 1}, column ${col + 1}`}
      className={`flex aspect-square select-none items-center justify-center text-xl leading-none ${right} ${bottom} ${fill} ${text}`}
    >
      {value !== 0 ? value : ""}
    </button>
  );
}
