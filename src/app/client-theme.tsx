"use client";

import { useLayoutEffect } from "react";

function applyTheme(theme: string, dark: boolean) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", dark);
}

export function ClientThemeProvider() {
  useLayoutEffect(() => {
    const storedTheme =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("sudoku:theme")
        : null;
    const theme = storedTheme === "emerald" || storedTheme === "ink" ? storedTheme : "classic";

    const stored =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("sudoku:appearance")
        : null;
    const appearance = (stored === "light" || stored === "dark" || stored === "system")
      ? stored
      : "system";

    let dark: boolean;
    if (appearance === "system") {
      dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      dark = appearance === "dark";
    }
    applyTheme(theme, dark);
  }, []);

  return null;
}
