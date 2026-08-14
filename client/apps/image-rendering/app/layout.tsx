import "./globals.css";

import type { Metadata } from "next";
import { cn } from "@healthalst/ui/lib/utils";
import { fraunces, interTight, jetbrainsMono } from "./fonts";
import { AppProviders } from "@/modules/app/app-providers";

export const metadata: Metadata = {
  title: "healthAlst",
  description: "healthAlst full-stack workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(fraunces.variable, interTight.variable, jetbrainsMono.variable)}>
      <body className="font-sans antialiased"><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
