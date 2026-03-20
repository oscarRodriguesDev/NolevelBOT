"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./providers";

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </>
  );
}