"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Search({ placeholder = "Cari produk..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [val, setVal] = useState(params.get("q") ?? "");
  const t = useRef<NodeJS.Timeout | null>(null);

  const push = useCallback((v: string) => {
    const q = new URLSearchParams(params);
    if (v) q.set("q", v); else q.delete("q");
    router.replace(`${pathname}?${q.toString()}`);
  }, [params, pathname, router]);

  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => push(val), 300);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [val, push]);

  return (
    <div className="relative">
      <input
        className="
          w-full rounded-xl
          border border-neutral-300 dark:border-neutral-700
          bg-white dark:bg-neutral-800
          text-neutral-900 dark:text-white
          placeholder-neutral-500 dark:placeholder-white/70
          px-4 py-2.5 pr-10 outline-none
          shadow-sm focus:shadow-md
          focus:ring-2 ring-neutral-900/10 dark:ring-white/20
          transition-colors
        "
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">⌘K</span>
    </div>
  );
}
