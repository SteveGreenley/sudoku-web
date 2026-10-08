// The same-number appearance, swappable in one place: "bold" reproduces
// today's rendering; "shade" fills every same-number cell with the single
// accent color (ticket 04). A per-value palette of nine colors (one per
// number 1–9, each with dark + light variants) replaces the single accent
// in ticket 05.

export type SameNumberAppearance = "bold" | "shade";

export const sameNumberAppearance: SameNumberAppearance = "shade";

/* 
Palette (for Tailwind detection):
bg-rose-300 bg-rose-100 text-rose-900 text-rose-700
bg-orange-300 bg-orange-100 text-orange-900 text-orange-700
bg-amber-300 bg-amber-100 text-amber-900 text-amber-700
bg-yellow-300 bg-yellow-100 text-yellow-900 text-yellow-800
bg-lime-300 bg-lime-100 text-lime-900 text-lime-700
bg-emerald-300 bg-emerald-100 text-emerald-900 text-emerald-700
bg-teal-300 bg-teal-100 text-teal-900 text-teal-700
bg-cyan-300 bg-cyan-100 text-cyan-900 text-cyan-700
bg-violet-300 bg-violet-100 text-violet-900 text-violet-700
*/
// A palette of nine colors, keyed by the number's value (index = value - 1),
// each with a dark variant (selected cell) and a light variant (other
// instances). All pairs are mutually distinguishable and clear of the app's
// blue selection/highlight fills, red mistake color, and zinc neutrals.
//
// Palette: 1 rose, 2 orange, 3 amber, 4 yellow, 5 lime, 6 emerald,
//          7 teal, 8 cyan, 9 violet — with text colors chosen per variant
//          for legibility.
const PALETTE: { readonly dark: { readonly bg: string; readonly text: string }; readonly light: { readonly bg: string; readonly text: string } }[] = [
  // 1: rose
  { dark: { bg: "#fecdd3", text: "#881337" }, light: { bg: "#fdf2f8", text: "#9d174c" } },
  // 2: orange
  { dark: { bg: "#fed7aa", text: "#431407" }, light: { bg: "#fff7ed", text: "#9a3412" } },
  // 3: amber
  { dark: { bg: "#fcd34d", text: "#451a03" }, light: { bg: "#fef3c7", text: "#78350f" } },
  // 4: yellow
  { dark: { bg: "#fde047", text: "#422006" }, light: { bg: "#fef9c3", text: "#854d0e" } },
  // 5: lime
  { dark: { bg: "#d9f99d", text: "#3f6212" }, light: { bg: "#ecfccb", text: "#4d7c0f" } },
  // 6: emerald
  { dark: { bg: "#a7f3d0", text: "#064e3b" }, light: { bg: "#d1fae5", text: "#065f46" } },
  // 7: teal
  { dark: { bg: "#99e9d8", text: "#042f2e" }, light: { bg: "#ccfbf1", text: "#115e59" } },
  // 8: cyan
  { dark: { bg: "#a5f3fc", text: "#164e63" }, light: { bg: "#cffafe", text: "#155e75" } },
  // 9: violet
  { dark: { bg: "#ddd6fe", text: "#4c1d95" }, light: { bg: "#ede9fe", text: "#6b21a8" } },
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
  const entry = PALETTE[value - 1];
  const variant = isSelected ? entry.dark : entry.light;
  return {
    background: variant.bg,
    text: weight,
    textColor: variant.text,
    noteEmphasis: note,
  };
}
