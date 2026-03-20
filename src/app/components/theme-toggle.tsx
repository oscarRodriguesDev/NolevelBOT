"use client";

import { useTheme } from "../providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
    
    <button onClick={toggleTheme}>
  {theme === "light" ? "💡" : "⚫"}
    </button>
    </>
  );
}