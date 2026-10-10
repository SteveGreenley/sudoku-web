import { useEffect, useRef } from "react";
import { computeHighlights, type GameState } from "@/game";
import { Cell } from "./Cell";

const DRAG_THRESHOLD_PX = 8;

interface BoardProps {
  state: GameState;
  onTapCell: (index: number) => void;
  onAddSelected: (index: number) => void;
  onClearSelection: () => void;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  width?: number;
}

function cellIndexAt(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const cellEl = el.closest("[data-cell-index]");
  if (!cellEl) return null;
  const index = Number(cellEl.getAttribute("data-cell-index"));
  return Number.isInteger(index) ? index : null;
}

export function Board({
  state,
  onTapCell,
  onAddSelected,
  onClearSelection,
  onGestureStart,
  onGestureEnd,
  width,
}: BoardProps) {
  const highlights = state.cellSelectionMode ? null : computeHighlights(state);

  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const canDragRef = useRef(false);
  const originRef = useRef<number | null>(null);
  const selectionAtDownRef = useRef<number[]>([]);
  const stateRef = useRef(state);
  const onTapCellRef = useRef(onTapCell);
  const onAddSelectedRef = useRef(onAddSelected);
  const onClearSelectionRef = useRef(onClearSelection);
  const onGestureStartRef = useRef(onGestureStart);
  const onGestureEndRef = useRef(onGestureEnd);
  useEffect(() => {
    stateRef.current = state;
    onTapCellRef.current = onTapCell;
    onAddSelectedRef.current = onAddSelected;
    onClearSelectionRef.current = onClearSelection;
    onGestureStartRef.current = onGestureStart;
    onGestureEndRef.current = onGestureEnd;
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== null) return;
    onGestureStartRef.current();
    const index = cellIndexAt(e.clientX, e.clientY);
    if (index === null) return;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isDraggingRef.current = false;
    canDragRef.current =
      !stateRef.current.givens[index] && stateRef.current.board[index] === 0;
    originRef.current = index;
    selectionAtDownRef.current = [...stateRef.current.selectedCells];
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      if (!isDraggingRef.current) {
        const dx = e.clientX - startXRef.current;
        const dy = e.clientY - startYRef.current;
        if (Math.hypot(dx, dy) <= DRAG_THRESHOLD_PX) return;
        isDraggingRef.current = true;
        onClearSelectionRef.current();
      }
      if (!canDragRef.current) return;
      const index = cellIndexAt(e.clientX, e.clientY);
      if (index === null) return;
      const s = stateRef.current;
      if (s.givens[index] || s.board[index] !== 0) return;
      if (s.selectedCells.includes(index)) return;
      onAddSelectedRef.current(index);
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerIdRef.current) return;
      onGestureEndRef.current();
      const origin = originRef.current;
      if (origin !== null) {
        // A drag that selected no new cell is released as a plain tap on
        // the origin, per the spec.
        const addedNewCell = stateRef.current.selectedCells.some(
          (cell) => !selectionAtDownRef.current.includes(cell),
        );
        if (!addedNewCell) onTapCellRef.current(origin);
      }
      pointerIdRef.current = null;
      isDraggingRef.current = false;
      canDragRef.current = false;
      originRef.current = null;
      selectionAtDownRef.current = [];
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  return (
    <div
      className="grid w-[min(90vw,432px)] touch-none grid-cols-9 rounded border-l-2 border-r-[5px] border-b-[5px] border-t-2 border-line-strong shadow-md"
      style={width ? { width: `${width}px`, height: `${width}px` } : undefined}
      role="grid"
      aria-label="Sudoku board"
      onPointerDown={handlePointerDown}
    >
      {state.board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          solutionValue={state.solution[index]}
          isGiven={state.givens[index]}
          notes={state.notes[index]}
          isSelected={state.selected === index}
          isHighlighted={highlights?.highlighted.has(index) ?? false}
          isSameNumber={highlights?.bold.has(index) ?? false}
          isSameNoteNumber={highlights?.boldNotes.has(index) ?? false}
          selectedValue={state.board[state.selected ?? -1] ?? 0}
          isInSelection={state.selectedCells.includes(index)}
          inSelectionMode={state.cellSelectionMode}
        />
      ))}
    </div>
  );
}
