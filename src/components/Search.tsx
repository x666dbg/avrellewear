"use client";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = { placeholder?: string };

export default function Search({ placeholder = "Cari produk..." }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setQuery = useDebouncedCallback((v: string) => {
    const q = new URLSearchParams(params);
    if (v) q.set("q", v); else q.delete("q");
    router.replace(`${pathname}?${q.toString()}`);
  }, 300);

  return (
    <div className="relative">
      <input
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70
                   px-4 py-2.5 pr-10 outline-none focus:ring-2 ring-slate-900/10 dark:ring-white/10"
        placeholder={placeholder}
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">⌘K</span>
    </div>
  );
}
