import { SIZE } from "@/game";

interface CellProps {
  index: number;
  value: number;
  solutionValue: number;
  isGiven: boolean;
  notes: number[];
  isSelected: boolean;
  onSelect: (cell: number) => void;
  onPlace?: (cell: number, value: number) => void;
}

export function Cell({
  index,
  value,
  solutionValue,
  isGiven,
  notes,
  isSelected,
  onSelect,
  onPlace,
}: CellProps) {
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
  const fill = isSelected ? "bg-blue-300" : "bg-white hover:bg-zinc-100";

  const isMistake =
    value !== 0 && !isGiven && value !== solutionValue;
  const text = isGiven
    ? "font-semibold text-zinc-900"
    : isMistake
      ? "font-medium text-red-500"
      : "text-blue-600";

  const handleClick = () => {
    onSelect(index);
    if (onPlace && value !== 0 && !isGiven) {
      onPlace(index, value);
    }
  };

  const noteGrid =
    notes.length > 0
      ? `grid grid-cols-3 gap-x-1 gap-y-0.5 p-0.5 text-[10px] leading-none text-zinc-500`
      : "";
  const noteItems = notes.filter((n) => n !== 0).sort((a, b) => a - b);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Row ${row + 1}, column ${col + 1}`}
      className={`flex aspect-square select-none items-center justify-center text-xl leading-none ${right} ${bottom} ${fill} ${text}`}
    >
      {value !== 0 ? (
        <span>{value}</span>
      ) : noteItems.length > 0 ? (
        <span className={noteGrid}>
          {noteItems.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </span>
      ) : null}
    </button>
  );
}