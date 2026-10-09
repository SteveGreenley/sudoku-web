// The same-number appearance, swappable in one place: "bold" reproduces
// today's rendering; "shade" fills every same-number cell with the single
// accent color (ticket 04). A per-value palette of nine colors (one per
// number 1–9, each with dark + light variants) replaces the single accent
// in ticket 05.

export type SameNumberAppearance = "bold" | "shade";

export const sameNumberAppearance: SameNumberAppearance = "shade";

/* 
Palette (for Tailwind detection):
bg-fuchsia-300 bg-fuchsia-100 text-fuchsia-900 text-fuchsia-700
bg-orange-300 bg-orange-100 text-orange-900 text-orange-700
bg-amber-500 bg-amber-100 text-amber-900 text-amber-600
bg-yellow-300 bg-yellow-100 text-yellow-900 text-yellow-800
bg-lime-300 bg-lime-100 text-lime-900 text-lime-700
bg-lime-400 bg-lime-50 text-lime-50 text-lime-700
bg-teal-400 bg-teal-100 text-teal-900 text-teal-600
bg-cyan-300 bg-cyan-100 text-cyan-900 text-cyan-700
bg-indigo-300 bg-indigo-100 text-indigo-900 text-indigo-700
*/
// A palette of nine colors, keyed by the number's value (index = value - 1),
// each with a dark variant (selected cell) and a light variant (other
// instances). All pairs are mutually distinguishable and clear of the app's
// blue selection/highlight fills, red mistake color, and zinc neutrals.
//
// Palette: 1 fuchsia (replaces rose to avoid red confusion), 2 orange,
//          3 amber, 4 yellow, 5 lime, 6 emerald, 7 teal, 8 cyan, 9 indigo
//          — with text colors chosen per variant for legibility.
const PALETTE: { readonly dark: { readonly bg: string; readonly text: string }; readonly light: { readonly bg: string; readonly text: string } }[] = [
  // 1: fuchsia (replaces rose — a purple-magenta, not red)
  { dark: { bg: "#f9a8d4", text: "#831843" }, light: { bg: "#fce7f3", text: "#be185d" } },
  // 2: orange
  { dark: { bg: "#fed7aa", text: "#431407" }, light: { bg: "#fff7ed", text: "#9a3412" } },
  // 3: amber (shifted more orange for contrast with yellow)
  { dark: { bg: "#f59e0b", text: "#78350f" }, light: { bg: "#fef3c7", text: "#d97706" } },
  // 4: yellow
  { dark: { bg: "#fde047", text: "#422006" }, light: { bg: "#fef9c3", text: "#ca8a04" } },
  // 5: lime
  { dark: { bg: "#d9f99d", text: "#3f6212" }, light: { bg: "#ecfccb", text: "#4d7c0f" } },
  // 6: lime green (bright lime, shifted away from green toward yellow-green)
  { dark: { bg: "#84cc16", text: "#36531d" }, light: { bg: "#f7fee7", text: "#65a30d" } },
  // 7: teal (shifted to blue-cyan, away from green)
  { dark: { bg: "#2dd4bf", text: "#115e59" }, light: { bg: "#ccfbf1", text: "#0d9488" } },
  // 8: cyan
  { dark: { bg: "#a5f3fc", text: "#164e63" }, light: { bg: "#cffafe", text: "#0891b2" } },
  // 9: indigo
  { dark: { bg: "#c7d2fe", text: "#312e81" }, light: { bg: "#e0e7ff", text: "#4f46e5" } },
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
