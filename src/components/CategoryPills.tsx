type Props = { categories: string[]; active?: string | undefined | null };

export default function CategoryPills({ categories, active }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/"
        className={`text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700
          ${!active ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
      >
        Semua
      </a>
      {categories.map(c => (
        <a
          key={c}
          href={`/?cat=${encodeURIComponent(c)}`}
          className={`text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700
            ${active === c ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
        >
          {c}
        </a>
      ))}
    </div>
  );
}
