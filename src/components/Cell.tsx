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
  scaleFactor?: number;
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
  scaleFactor = 1,
}: CellProps) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;

  // Scale border widths: base 2px * scaleFactor, clamped 1.5–4px
  const innerBorderWidth = Math.max(3, Math.min(4, 2 * scaleFactor));
  const outerBorderWidth = Math.max(2, Math.min(6, 4 * scaleFactor));

  // Build border styles based on cell position (3x3 subgrid lines)
  const borderStyle: React.CSSProperties = {
    borderRightWidth: col === 8 ? 0 : col === 2 || col === 5 ? innerBorderWidth : 1,
    borderBottomWidth: row === 8 ? 0 : row === 2 || row === 5 ? innerBorderWidth : 1,
    borderColor: "var(--color-line)",
  };

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
      ? `outline-[${Math.max(2, Math.round(outerBorderWidth))}px] outline-dashed outline-accent-outline -outline-offset-2`
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

  // Scale font sizes: number 16px * scaleFactor (12–24px), notes 10px * scaleFactor (7–14px)
  const numberFontSize = Math.max(12, Math.min(24, 16 * scaleFactor));
  const noteFontSize = Math.max(7, Math.min(14, 10 * scaleFactor));

  const noteGrid =
    notes.length > 0 ? "grid grid-cols-3 gap-x-1 gap-y-0.5 p-0.5 text-text-soft" : "";

  const noteItems = notes.filter((n) => n !== 0).sort((a, b) => a - b);

  return (
    <button
      type="button"
      data-cell-index={index}
      aria-label={`Row ${row + 1}, column ${col + 1}`}
      className={`flex aspect-square select-none items-center justify-center ${fill} ${selectionMarker} ${text}`}
      style={{
        ...bgStyle,
        ...colorStyle,
        ...borderStyle,
        fontSize: `${numberFontSize}px`,
      }}
    >
      {value !== 0 ? (
        <span>{value}</span>
      ) : noteItems.length > 0 ? (
        <span className={noteGrid} style={{ fontSize: `${noteFontSize}px` }}>
          {noteItems.map((n) => (
            <span key={n} className={sameNumber.noteEmphasis && n === selectedValue ? sameNumber.noteEmphasis : ""}>{n}</span>
          ))}
        </span>
      ) : null}
    </button>
  );
}
