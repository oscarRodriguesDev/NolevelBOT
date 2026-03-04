"use client";

import { ThemeToggle } from "./components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ThemeToggle />
      <h1>NolevelBOT</h1>
    </div>
  );
}