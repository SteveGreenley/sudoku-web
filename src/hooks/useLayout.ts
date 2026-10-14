import { useCallback, useEffect, useMemo, useState } from "react";

// Device category determined by viewport + device features (touch, user agent)
export type DeviceCategory =
  | "smallPhone"
  | "normalPhone"
  | "largePhone"
  | "ipadMini"
  | "ipadAir"
  | "ipadPro"
  | "desktop";

// Layout mode combining orientation, device category, and viewport range
export type LayoutMode =
  // Narrow portrait (< 375px viewport) — stacked, narrow board
  | "narrowPortrait"
  // Wide portrait (tablet/desktop, width ≥ 768) — stacked, wide board
  | "widePortrait"
  // Landscape modes (phone, tablet, desktop) — side-by-side
  | "phoneLandscape"
  | "tabletLandscape"
  | "desktopLandscape";

export interface LayoutState {
  isLandscape: boolean;
  viewportWidth: number;
  viewportHeight: number;
  deviceCategory: DeviceCategory;
  layoutMode: LayoutMode;
  // Derived board dimensions
  portraitMax?: number;
  landscapeMax?: number;
}

/**
 * Detect device category from viewport dimensions + device features.
 * Uses user agent + maxTouchPoints to disambiguate cases where viewport
 * width alone is unreliable (e.g. iPad split-screen, small browser windows).
 */
export function detectDeviceCategory(
  viewportWidth: number,
  viewportHeight: number,
  isLandscape: boolean,
  userAgent?: string,
  maxTouchPoints?: number,
): DeviceCategory {
  // Check user agent for device type
  const ua = userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  const maxTouch = maxTouchPoints ?? (typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0);
  const isIpad = /iPad/i.test(ua) || (/\(Macintosh/i.test(ua) && maxTouch > 0);
  const isPhone = /iPhone|iPod|Android/i.test(ua);

  // Check phone first (UA takes priority)
  if (isPhone) {
    // Phone — use narrow dimension (portrait width) for consistent detection
    const narrowDim = Math.min(viewportWidth, viewportHeight);
    if (narrowDim < 375) return "smallPhone";
    if (narrowDim < 430) return "normalPhone";
    return "largePhone";
  }

  if (isIpad || (isLandscape && viewportWidth >= 768 && maxTouch > 0)) {
    // iPad / touch tablet — always detect using the narrow dimension (portrait width)
    const narrowDim = Math.min(viewportWidth, viewportHeight);
    if (narrowDim < 800) return "ipadMini";
    if (narrowDim < 900) return "ipadAir";
    return "ipadPro";
  }

  // Desktop (no touch, not phone/iPad)
  if (maxTouch > 0 && viewportWidth < 768) {
    // Fallback: small viewport + touch = phone (no UA available)
    const narrowDim = Math.min(viewportWidth, viewportHeight);
    if (narrowDim < 375) return "smallPhone";
    if (narrowDim < 430) return "normalPhone";
    return "largePhone";
  }
  return "desktop";
}

/**
 * Determine layout mode from device category + viewport + orientation.
 */
export function detectLayoutMode(
  deviceCategory: DeviceCategory,
  viewportWidth: number,
  viewportHeight: number,
  isLandscape: boolean,
): LayoutMode {
  if (isLandscape) {
    switch (deviceCategory) {
      case "smallPhone":
      case "normalPhone":
      case "largePhone":
        return "phoneLandscape";
      case "ipadMini":
      case "ipadAir":
      case "ipadPro":
        return "tabletLandscape";
      case "desktop":
        return "desktopLandscape";
    }
  }

  // Portrait
  if (deviceCategory === "desktop") {
    // Desktop portrait
    return viewportWidth >= 768 ? "widePortrait" : "narrowPortrait";
  }

  return viewportWidth >= 768 ? "widePortrait" : "narrowPortrait";
}

/**
 * Get the portrait and landscape max board widths for a device category.
 */
const deviceMaxMap: Record<DeviceCategory, { portraitMax: number; landscapeMax: number }> = {
  smallPhone: { portraitMax: 360, landscapeMax: 560 },
  normalPhone: { portraitMax: 400, landscapeMax: 560 },
  largePhone: { portraitMax: 432, landscapeMax: 560 },
  ipadMini: { portraitMax: 650, landscapeMax: 780 },
  ipadAir: { portraitMax: 700, landscapeMax: 820 },
  ipadPro: { portraitMax: 800, landscapeMax: 950 },
  desktop: { portraitMax: 800, landscapeMax: 950 },
};

export function useLayout(): LayoutState {
  const [state, setState] = useState<LayoutState>({
    isLandscape: false,
    viewportWidth: 0,
    viewportHeight: 0,
    deviceCategory: "desktop",
    layoutMode: "narrowPortrait",
  });

  const measure = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;

    // Skip state update if only the landscape flag changed (dimensions same).
    // But if dimensions changed, recompute everything.
    setState((prev) => {
      const dimensionsChanged = prev.viewportWidth !== width || prev.viewportHeight !== height;
      const landscapeChanged = prev.isLandscape !== isLandscape;

      if (!dimensionsChanged && !landscapeChanged) {
        return prev;
      }

      const deviceCategory = detectDeviceCategory(width, height, isLandscape);
      const layoutMode = detectLayoutMode(deviceCategory, width, height, isLandscape);
      const { portraitMax, landscapeMax } = deviceMaxMap[deviceCategory];

      return {
        isLandscape,
        viewportWidth: width,
        viewportHeight: height,
        deviceCategory,
        layoutMode,
        portraitMax,
        landscapeMax,
      };
    });
  }, []);

  useEffect(() => {
    // SSR renders portrait (isLandscape: false, 0 dimensions).
    // On mount, measure the actual viewport; if landscape, state updates.
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return state;
}
