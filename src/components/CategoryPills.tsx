import Link from "next/link";

type Props = { categories: string[]; active?: string | undefined | null };

export default function CategoryPills({ categories, active }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`text-sm px-3 py-1.5 rounded-full border
          ${!active
            ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
            : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
      >
        Semua
      </Link>
      {categories.map(c => (
        <Link
          key={c}
          href={`/?cat=${encodeURIComponent(c)}`}
          className={`text-sm px-3 py-1.5 rounded-full border
            ${active === c
              ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
              : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          {c}
        </Link>
      ))}
    </div>
  );
}
