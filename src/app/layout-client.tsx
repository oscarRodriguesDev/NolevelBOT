"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./providers";
import { SessionProvider } from "next-auth/react"

// Layout cliente com providers de tema e sessao
export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeProvider>
     <SessionProvider> 

        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              zIndex: 99999,
            },
          }}
        />

        </SessionProvider> 
      </ThemeProvider>
    </>
  );
}