// The same-number appearance, swappable in one place: flip the switch to
// "shade" once tickets 04/05 land the variants and palette.

export type SameNumberAppearance = "bold" | "shade";

export const sameNumberAppearance: SameNumberAppearance = "bold";

export interface SameNumberStyle {
  /** Cell background class, or null to keep the cell's own fill cascade. */
  background: string | null;
  /** Class for the number's font weight, or null to keep the cell's given/default weight. */
  text: string | null;
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
    return { background: null, text: weight, noteEmphasis: note };
  }
  // shade (placeholder, replaced by tickets 04/05): the selected cell takes
  // the dark variant (overriding the blue-300 selection fill) and the other
  // instances the light one (over the row/column/box fill), keyed by `value`.
  // `isSelected` picks the variant. Until the variants land, shade renders
  // exactly like bold, so flipping the switch changes nothing visually.
  return { background: null, text: weight, noteEmphasis: note };
}
