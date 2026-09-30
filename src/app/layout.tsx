import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sudoku",
  description:
    "A sudoku game that plays entirely in your browser: no account, no backend, no network.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-100 font-sans text-zinc-900">
        {children}
      </body>
    </html>
  );
}
