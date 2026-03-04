"use client";

import { ThemeProvider } from "./providers";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
