"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Theme = "classic" | "emerald" | "ink";
type Appearance = "system" | "light" | "dark";

const THEMES: { value: Theme; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "emerald", label: "Emerald" },
  { value: "ink", label: "Ink" },
];

const APPEARANCES: { value: Appearance; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

// Theme preview color palettes (accent + surface + textStrong + lineStrong)
const THEME_PALETTES: Record<Theme, { accent: string; surface: string; textStrong: string; lineStrong: string }> = {
  classic: { accent: "#2563eb", surface: "#f4f4f5", textStrong: "#18181b", lineStrong: "#27272a" },
  emerald: { accent: "#059669", surface: "#f4f4f5", textStrong: "#18181b", lineStrong: "#27272a" },
  ink: { accent: "#a8a29e", surface: "#fafaf9", textStrong: "#0c0a09", lineStrong: "#1c1917" },
};

function getStoredTheme(): Theme {
  const stored = typeof localStorage !== "undefined"
    ? localStorage.getItem("sudoku:theme")
    : null;
  return stored === "emerald" || stored === "ink" ? stored : "classic";
}

function getStoredAppearance(): Appearance {
  const stored = typeof localStorage !== "undefined"
    ? localStorage.getItem("sudoku:appearance")
    : null;
  return (stored === "light" || stored === "dark" || stored === "system") ? stored : "system";
}

function applyTheme(theme: Theme, appearance: Appearance) {
  const { applyDark } = getAppearanceState(appearance);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", applyDark);
  localStorage.setItem("sudoku:theme", theme);
  localStorage.setItem("sudoku:appearance", appearance);
}

function getAppearanceState(appearance: Appearance): { applyDark: boolean } {
  let dark: boolean;
  if (appearance === "system") {
    dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    dark = appearance === "dark";
  }
  return { applyDark: dark };
}

function isDarkForAppearance(appearance: Appearance): boolean {
  if (appearance === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return appearance === "dark";
}

function ThemePreview({ theme, appearance }: { theme: Theme; appearance: Appearance }) {
  const p = THEME_PALETTES[theme];
  const dark = isDarkForAppearance(appearance);

  // Dark mode surface for the preview (dark background swatch in row 1)
  const darkSurface = "#27272a";

  return (
    <div
      className="rounded-lg p-3"
      style={{ backgroundColor: p.surface }}
    >
      {/* Row 1: accent swatch + surface */}
      <div className="mb-1.5 flex gap-1.5">
        <div
          className="h-5 w-8 rounded-sm"
          style={{ backgroundColor: p.accent }}
        />
        <div
          className="h-5 w-8 rounded-sm border"
          style={{ borderColor: p.lineStrong }}
        />
        <div
          className="h-5 w-8 rounded-sm border"
          style={{ backgroundColor: dark ? darkSurface : p.surface }}
        />
      </div>
      {/* Row 2: text + line */}
      <div className="flex gap-1.5">
        <div
          className="h-5 w-8 rounded-sm"
          style={{ backgroundColor: p.textStrong }}
        />
        <div
          className="h-5 w-8 rounded-sm border"
          style={{ borderColor: p.lineStrong }}
        />
        <div
          className="h-5 w-8 rounded-sm rounded-full"
          style={{ backgroundColor: p.accent }}
        />
      </div>
    </div>
  );
}

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [appearance, setAppearance] = useState<Appearance>(getStoredAppearance);

  const panelRef = useRef<HTMLDivElement>(null);

  const handleConfirm = useCallback(() => {
    applyTheme(theme, appearance);
    onClose();
  }, [theme, appearance, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-16"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="max-h-[calc(100vh-8rem)] w-[min(90vw,480px)] overflow-y-auto rounded-xl bg-surface shadow-xl"
      >
        <div className="p-6">
          <h2 className="mb-6 font-heading text-2xl font-bold text-text-strong">
            Appearance
          </h2>

          {/* Theme selector */}
          <div className="mb-8">
            <h3 className="mb-3 text-base font-medium text-text-soft">
              Theme
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                    theme === t.value
                      ? "border-ink bg-ink text-inverse"
                      : "border-line bg-surface text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  <ThemePreview theme={t.value} appearance={appearance} />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appearance selector */}
          <div className="mb-8">
            <h3 className="mb-3 text-base font-medium text-text-soft">
              Appearance
            </h3>
            <div className="space-y-2">
              {APPEARANCES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAppearance(a.value)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    appearance === a.value
                      ? "border-ink bg-ink text-inverse"
                      : "border-line bg-surface text-text-muted hover:bg-surface-hover"
                  }`}
                >
                  <span className="text-sm font-medium">{a.label}</span>
                  {a.value === "system" && (
                    <span
                      className="text-xs"
                      style={
                        appearance === "system"
                          ? {}
                          : { opacity: 0.5 }
                      }
                    >
                      (follows your OS preference)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-text-muted shadow-sm transition-colors hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-md border border-ink bg-ink px-4 py-2 text-sm font-medium text-inverse shadow-sm transition-colors hover:bg-ink-hover"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
