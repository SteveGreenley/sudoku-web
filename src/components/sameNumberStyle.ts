// The same-number appearance, swappable in one place: "bold" reproduces
// today's rendering; "shade" fills every same-number cell with the single
// accent color (ticket 04). A per-value palette of nine colors (one per
// number 1–9, each with dark + light variants) replaces the single accent
// in ticket 05.

export type SameNumberAppearance = "bold" | "shade";

export const sameNumberAppearance: SameNumberAppearance = "shade";

// A palette of nine colors, keyed by the number's value (index = value - 1),
// each with a dark variant (selected cell) and a light variant (other
// instances). All pairs are mutually distinguishable and clear of the app's
// blue selection/highlight fills, red mistake color, and zinc neutrals.
//
// Palette: 1 rose, 2 orange, 3 amber, 4 yellow, 5 lime, 6 emerald,
//          7 teal, 8 cyan, 9 violet — with text colors chosen per variant
//          for legibility.
const PALETTE: { readonly dark: readonly [string, string]; readonly light: readonly [string, string] }[] = [
  // 1: rose
  { dark: ["bg-rose-300", "text-rose-900"], light: ["bg-rose-100", "text-rose-700"] },
  // 2: orange
  { dark: ["bg-orange-300", "text-orange-900"], light: ["bg-orange-100", "text-orange-700"] },
  // 3: amber
  { dark: ["bg-amber-300", "text-amber-900"], light: ["bg-amber-100", "text-amber-700"] },
  // 4: yellow
  { dark: ["bg-yellow-300", "text-yellow-900"], light: ["bg-yellow-100", "text-yellow-800"] },
  // 5: lime
  { dark: ["bg-lime-300", "text-lime-900"], light: ["bg-lime-100", "text-lime-700"] },
  // 6: emerald
  { dark: ["bg-emerald-300", "text-emerald-900"], light: ["bg-emerald-100", "text-emerald-700"] },
  // 7: teal
  { dark: ["bg-teal-300", "text-teal-900"], light: ["bg-teal-100", "text-teal-700"] },
  // 8: cyan
  { dark: ["bg-cyan-300", "text-cyan-900"], light: ["bg-cyan-100", "text-cyan-700"] },
  // 9: violet
  { dark: ["bg-violet-300", "text-violet-900"], light: ["bg-violet-100", "text-violet-700"] },
];

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
  // shade: the selected same-number cell takes the dark variant of its value's
  // palette color (overriding the blue-300 selection fill); every other
  // instance takes the light variant (over the row/column/box fill); cells
  // outside the set keep their own fill and color cascades. Notes-only cells
  // are never in the set, so they take no shade — only the note bold.
  if (!isSameNumber) {
    return { background: null, text: weight, textColor: null, noteEmphasis: note };
  }
  const dark = isSelected;
  const entry = PALETTE[value - 1];
  const variant = dark ? entry.dark : entry.light;
  return {
    background: variant[0],
    text: weight,
    textColor: variant[1],
    noteEmphasis: note,
  };
}
