import type { Metadata } from "next";
import { Abril_Fatface, Poppins } from "next/font/google";
import "./globals.css";
import { ClientThemeProvider } from "./client-theme";

const poppins = Poppins({
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const abril = Abril_Fatface({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Sudoku",
  description:
    "A sudoku game that plays entirely in your browser: no account, no backend, no network.",
};

function getAppearance(): { theme: string; dark: boolean } {
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

  if (appearance === "system") {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return { theme, dark: prefersDark };
  }
  return { theme, dark: appearance === "dark" };
}

function PrePaintScript() {
  const { theme, dark } = getAppearance();
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t="${theme}",d=localStorage.getItem("sudoku:appearance");d&&d!=="system"?document.documentElement.setAttribute("data-theme",t):document.documentElement.setAttribute("data-theme",t),d?document.documentElement.classList.toggle("dark",d==="dark"):document.documentElement.classList.toggle("dark",window.matchMedia("(prefers-color-scheme:dark)").matches)}catch(e){}})()`,
      }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${abril.variable}`}
      data-theme="classic"
      suppressHydrationWarning
    >
      <head>
        <PrePaintScript />
      </head>
      <body className="flex min-h-full flex-col bg-page text-text-strong">
        <ClientThemeProvider />
        {children}
      </body>
    </html>
  );
}
