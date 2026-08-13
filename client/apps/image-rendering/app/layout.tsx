import "@healthalst/ui/globals.css";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "healthAlst",
  description: "healthAlst full-stack workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

