import type { GameState } from "./state";

export interface HighlightSet {
  highlighted: Set<number>;
  bold: Set<number>;
}

export function computeHighlights(state: GameState): HighlightSet | null {
  const { selected } = state;
  if (selected === null) return null;

  const row = Math.floor(selected / 9);
  const col = selected % 9;

  const highlighted = new Set<number>();

  for (let i = 0; i < 81; i++) {
    if (i === selected) continue;
    const r = Math.floor(i / 9);
    const c = i % 9;
    const sameRow = r === row;
    const sameCol = c === col;
    const sameBox =
      Math.floor(r / 3) === Math.floor(row / 3) &&
      Math.floor(c / 3) === Math.floor(col / 3);
    if (sameRow || sameCol || sameBox) {
      highlighted.add(i);
    }
  }

  const bold = new Set<number>();
  const selectedValue = state.board[selected];
  if (selectedValue !== 0) {
    for (let i = 0; i < 81; i++) {
      if (i === selected) continue;
      if (state.board[i] === selectedValue) {
        bold.add(i);
      }
    }
  }

  return { highlighted, bold };
}
