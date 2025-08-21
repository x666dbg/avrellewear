"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function toggle() {
    const root = document.documentElement;
    const nowDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nowDark);
    try { localStorage.setItem("theme", nowDark ? "dark" : "light"); } catch {}
  }

  if (!mounted) {
    return (
      <button aria-label="Toggle theme" className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700" />
    );
  }

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-9 w-9 grid place-items-center rounded-full border border-slate-200 bg-white/70 backdrop-blur hover:bg-white transition
                 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
      title="Dark / Light"
    >
      <span className="relative block h-5 w-5">
        <span className={`absolute inset-0 rounded-full bg-amber-400 shadow ${isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"} transition`} />
        <span className={`absolute inset-0 rounded-full bg-slate-200 ${isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition`} />
      </span>
    </button>
  );
}
