import { SIZE } from "@/game";
import { sameNumberStyle } from "./sameNumberStyle";

interface CellProps {
  index: number;
  value: number;
  solutionValue: number;
  isGiven: boolean;
  notes: number[];
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  isSameNoteNumber: boolean;
  isInSelection: boolean;
  inSelectionMode: boolean;
  selectedValue: number;
}

export function Cell({
  index,
  value,
  solutionValue,
  isGiven,
  notes,
  isSelected,
  isHighlighted,
  isSameNumber,
  isSameNoteNumber,
  isInSelection,
  inSelectionMode,
  selectedValue,
}: CellProps) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const right =
    col === 2 || col === 5 || col === 8
      ? "border-r-2 border-r-zinc-800"
      : "border-r border-zinc-300";
  const bottom =
    row === 2 || row === 5 || row === 8
      ? "border-b-2 border-b-zinc-800"
      : "border-b border-b-zinc-300";
  const sameNumber = sameNumberStyle(
    value,
    isSelected,
    isSameNumber,
    isSameNoteNumber,
  );
  const baseFill = inSelectionMode
    ? "bg-white"
    : isSelected
      ? "bg-blue-300"
      : isHighlighted
        ? "bg-blue-100"
        : "bg-white hover:bg-zinc-100";
  const fill = sameNumber.background ?? baseFill;
  const selectionMarker =
    inSelectionMode && isInSelection
      ? "outline-2 outline-dashed outline-blue-500 -outline-offset-2"
      : "";

  const isMistake =
    value !== 0 && !isGiven && value !== solutionValue;
  const baseTextColor = isGiven ? "text-zinc-900" : "text-blue-600";
  const fontWeight = sameNumber.text ?? (isGiven ? "font-semibold" : "font-normal");
  const textColor = isMistake ? "text-red-500" : sameNumber.textColor ?? baseTextColor;
  const text = `${fontWeight} ${textColor}`;

  const noteGrid =
    notes.length > 0
      ? `grid grid-cols-3 gap-x-1 gap-y-0.5 p-0.5 text-[10px] leading-none text-zinc-500`
      : "";
  const noteItems = notes.filter((n) => n !== 0).sort((a, b) => a - b);

  return (
    <button
      type="button"
      data-cell-index={index}
      aria-label={`Row ${row + 1}, column ${col + 1}`}
      className={`flex aspect-square select-none items-center justify-center text-xl leading-none ${right} ${bottom} ${fill} ${selectionMarker} ${text}`}
    >
      {value !== 0 ? (
        <span>{value}</span>
      ) : noteItems.length > 0 ? (
        <span className={noteGrid}>
          {noteItems.map((n) => (
            <span key={n} className={sameNumber.noteEmphasis && n === selectedValue ? sameNumber.noteEmphasis : ""}>{n}</span>
          ))}
        </span>
      ) : null}
    </button>
  );
}
