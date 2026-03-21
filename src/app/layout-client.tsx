"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./providers";
import { SessionProvider } from "next-auth/react"

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeProvider>
     <SessionProvider> 

        {children}

        </SessionProvider> 
      </ThemeProvider>
    </>
  );
}