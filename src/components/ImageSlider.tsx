"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  alt: string;
  aspect?: string; // default: square
};

export default function ImageSlider({ images, alt, aspect = "aspect-square" }: Props) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const safeImages = images?.length ? images : ["/placeholder.svg"];
  const len = safeImages.length;

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + len) % len);
  }, [len]);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % len);
  }, [len]);

  const go = useCallback((i: number) => setIdx(i), []);

  // keyboard arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    if (start == null) return;
    const end = e.changedTouches[0].clientX;
    const dx = end - start;
    if (Math.abs(dx) > 40) {
      if (dx > 0) prev();
      else next();
    }
    touchStartX.current = null;
  }

  return (
    <div className="w-full">
      {/* Main image */}
      <div
        className={`relative overflow-hidden rounded-xl ${aspect} select-none`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={safeImages[idx]}
          alt={`${alt} - ${idx + 1}`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {len > 1 && (
          <>
            <button
              aria-label="Sebelumnya"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 h-9 w-9 grid place-items-center hover:bg-white dark:hover:bg-slate-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-700 dark:text-slate-200">
                <path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              aria-label="Selanjutnya"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 h-9 w-9 grid place-items-center hover:bg-white dark:hover:bg-slate-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-700 dark:text-slate-200">
                <path fill="currentColor" d="M8.59 16.59L10 18l6-6l-6-6l-1.41 1.41L13.17 12z"/>
              </svg>
            </button>
          </>
        )}

        {/* dots (mobile) */}
        {len > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
            {safeImages.map((_, i) => (
              <button
                key={i}
                aria-label={`Ke gambar ${i + 1}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-slate-900 dark:bg-white" : "w-1.5 bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* thumbnails (desktop) */}
      {len > 1 && (
        <div className="mt-3 hidden md:grid grid-cols-5 gap-2">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`overflow-hidden rounded-lg border ${
                idx === i
                  ? "border-slate-900 dark:border-white"
                  : "border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="aspect-square">
                <img src={src} alt={`${alt} thumb ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
