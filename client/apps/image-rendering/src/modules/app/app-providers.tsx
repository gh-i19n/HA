"use client";

import { ThemeProvider } from "next-themes";

/** Shared client providers used by Eventorch-derived account and dashboard widgets. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class" defaultTheme="light" enableSystem>{children}</ThemeProvider>;
}
