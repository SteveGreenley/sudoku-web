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
    col === 2 || col === 5
      ? "border-r-2 border-r-line-strong"
      : col === 8
        ? ""
        : "border-r border-line";
  const bottom =
    row === 2 || row === 5
      ? "border-b-2 border-b-line-strong"
      : row === 8
        ? ""
        : "border-b border-line";
  const sameNumber = sameNumberStyle(
    value,
    isSelected,
    isSameNumber,
    isSameNoteNumber,
  );
  const isMistake =
    value !== 0 && !isGiven && value !== solutionValue;
  const baseFill = inSelectionMode
    ? "bg-surface"
    : isSelected
      ? "bg-accent-fill"
      : isHighlighted
        ? "bg-accent-soft"
        : "bg-surface hover:bg-surface-hover";
  const fill = isMistake
    ? "bg-red-500"
    : sameNumber.background && sameNumber.background.startsWith("#")
      ? ""
      : sameNumber.background ?? baseFill;
  const bgStyle = isMistake
    ? { background: "#ef4444" }
    : sameNumber.background?.startsWith("#")
      ? { background: sameNumber.background }
      : undefined;
  const selectionMarker =
    inSelectionMode && isInSelection
      ? "outline-2 outline-dashed outline-accent-outline -outline-offset-2"
      : "";

  const baseTextColor = isGiven ? "text-text-strong" : "text-accent";
  const fontWeight = isMistake ? "font-bold" : sameNumber.text ?? (isGiven ? "font-semibold" : "font-normal");
  const textColor = isMistake
    ? "text-inverse"
    : sameNumber.textColor && sameNumber.textColor.startsWith("#")
      ? ""
      : sameNumber.textColor ?? baseTextColor;
  const text = `${fontWeight} ${textColor}`;
  const colorStyle = sameNumber.textColor?.startsWith("#") && !isMistake ? { color: sameNumber.textColor } : undefined;

  const noteGrid =
    notes.length > 0
      ? `grid grid-cols-3 gap-x-1 gap-y-0.5 p-0.5 text-[10px] leading-none text-text-soft`
      : "";
  const noteItems = notes.filter((n) => n !== 0).sort((a, b) => a - b);

  return (
    <button
      type="button"
      data-cell-index={index}
      aria-label={`Row ${row + 1}, column ${col + 1}`}
      className={`flex aspect-square select-none items-center justify-center text-xl leading-none ${right} ${bottom} ${fill} ${selectionMarker} ${text}`}
      style={{ ...bgStyle, ...colorStyle }}
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
