import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sudoku",
  description:
    "A sudoku game that plays entirely in your browser: no account, no backend, no network.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`flex min-h-full flex-col bg-zinc-100 text-zinc-900 ${inter.className}`}
      >
        {children}
      </body>
    </html>
  );
}
