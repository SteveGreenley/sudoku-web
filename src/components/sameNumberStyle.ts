// The same-number appearance, swappable in one place: "bold" reproduces
// today's rendering; "shade" fills every same-number cell with the single
// accent color (ticket 04). A per-value palette of nine colors arrives in
// ticket 05, replacing the single accent.

export type SameNumberAppearance = "bold" | "shade";

export const sameNumberAppearance: SameNumberAppearance = "shade";

// One accent color with a dark and a light variant. Amber is distinct from
// the board's blue-300 selection fill, blue-100 row/column/box fill, red-500
// mistake text and zinc neutrals. Text colors are chosen per variant for
// legibility; a mistaken cell keeps its red text, composed in the cell.
const SHADE_DARK = "bg-amber-300";
const SHADE_DARK_TEXT = "text-amber-900";
const SHADE_LIGHT = "bg-amber-100";
const SHADE_LIGHT_TEXT = "text-amber-700";

export interface SameNumberStyle {
  /** Cell background class, or null to keep the cell's own fill cascade. */
  background: string | null;
  /** Class for the number's font weight, or null to keep the cell's given/default weight. */
  text: string | null;
  /** Class for the number's text color, or null to keep the cell's given/placed color. */
  textColor: string | null;
  /** Class for a note digit matching the selected value, or null for none. */
  noteEmphasis: string | null;
}

export function sameNumberStyle(
  value: number,
  isSelected: boolean,
  isSameNumber: boolean,
  isSameNoteNumber: boolean,
  appearance: SameNumberAppearance = sameNumberAppearance,
): SameNumberStyle {
  const weight = isSameNumber ? "font-black" : null;
  const note = isSameNoteNumber ? "font-black" : null;
  if (appearance !== "shade") {
    return { background: null, text: weight, textColor: null, noteEmphasis: note };
  }
  // shade: the selected same-number cell takes the dark variant (overriding
  // the blue-300 selection fill) with dark text; every other instance takes
  // the light variant (over the row/column/box fill) with lighter text;
  // cells outside the set keep their own fill and color cascades. Notes-only
  // cells are never in the set, so they take no shade — only the note bold.
  const dark = isSameNumber && isSelected;
  return {
    background: isSameNumber ? (dark ? SHADE_DARK : SHADE_LIGHT) : null,
    text: weight,
    textColor: isSameNumber ? (dark ? SHADE_DARK_TEXT : SHADE_LIGHT_TEXT) : null,
    noteEmphasis: note,
  };
}
