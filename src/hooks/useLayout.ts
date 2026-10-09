import { useCallback, useEffect, useState } from "react";

export interface LayoutState {
  isLandscape: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

export function useLayout(): LayoutState {
  const [state, setState] = useState<LayoutState>({
    isLandscape: false,
    viewportWidth: 0,
    viewportHeight: 0,
  });

  const measure = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setState((prev) => {
      // Skip state update if dimensions haven't changed (avoids unnecessary re-renders).
      if (prev.viewportWidth === width && prev.viewportHeight === height) {
        return prev;
      }
      return {
        isLandscape: width > height,
        viewportWidth: width,
        viewportHeight: height,
      };
    });
  }, []);

  useEffect(() => {
    // SSR renders portrait (isLandscape: false, 0 dimensions).
    // On mount, measure the actual viewport; if landscape, state updates.
    // This causes a brief portrait flash on landscape phones, acceptable for
    // v1 (no inline script or SSR hydration trickery).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return state;
}
