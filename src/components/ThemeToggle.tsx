"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  useEffect(() => setMounted(true), []);

  function toggle() {
    const root = document.documentElement;
    const nowDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nowDark);
    try { localStorage.setItem("theme", nowDark ? "dark" : "light"); } catch (e) {}
  }

  if (!mounted) {
    // Skeleton button to avoid hydration mismatch
    return (
      <button aria-label="Toggle theme" className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700" />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-9 w-9 grid place-items-center rounded-full border border-slate-200 bg-white/70 backdrop-blur hover:bg-white transition
                 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
      title="Dark / Light"
    >
      {/* Sun / Moon icon (pure CSS) */}
      <span className="relative block h-5 w-5">
        <span
          className={`absolute inset-0 rounded-full bg-amber-400 shadow ${isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"} transition`}
        />
        <span
          className={`absolute inset-0 rounded-full bg-slate-200 ${isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition`}
        />
      </span>
    </button>
  );
}
