"use client";

import { useTheme } from "../providers";
import { FaMoon, FaSun } from "react-icons/fa6";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-3 rounded-full transition-all duration-300 z-40 hover:scale-110 active:scale-95"
      style={{
        backgroundColor: "var(--primary)",
        color: "white",
      }}
      aria-label="Alternar tema"
    >
      {theme === "light" ? (
        <FaMoon size={20} />
      ) : (
        <FaSun size={20} />
      )}
    </button>
  );
}
