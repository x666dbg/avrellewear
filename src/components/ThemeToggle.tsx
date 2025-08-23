"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function setMetaColorScheme(mode: "light" | "dark") {
    const m = document.querySelector('meta[name="color-scheme"]');
    if (m) m.setAttribute("content", mode);
  }

  function toggle() {
    const root = document.documentElement;
    const nowDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nowDark);

    // Persist keduanya: cookie (untuk SSR) + localStorage (fallback)
    try {
      localStorage.setItem("theme", nowDark ? "dark" : "light");
      document.cookie = `theme=${nowDark ? "dark" : "light"}; Path=/; Max-Age=31536000; SameSite=Lax`;
      setMetaColorScheme(nowDark ? "dark" : "light");
    } catch {}
  }

  // Hindari mismatch icon sebelum mount
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-700"
      />
    );
  }

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-9 w-9 grid place-items-center rounded-full border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
      title="Dark / Light"
    >
      {/* indikator sederhana */}
      <span className="relative block h-5 w-5">
        <span className={`absolute inset-0 rounded-full ${isDark ? "opacity-0 scale-0" : "opacity-100 scale-100"} bg-amber-400 transition`} />
        <span className={`absolute inset-0 rounded-full ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"} bg-neutral-200 transition`} />
      </span>
    </button>
  );
}
