// src/components/CategoryPills.tsx
import Link from "next/link";

type Props = { categories: string[]; active?: string | null };

export default function CategoryPills({ categories, active }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/" className={`ui-pill ${!active ? "ui-pill-active" : ""}`}>
        Semua
      </Link>
      {categories.map((c) => {
        const isActive = active === c;
        return (
          <Link
            key={c}
            href={`/?cat=${encodeURIComponent(c)}`}
            className={`ui-pill ${isActive ? "ui-pill-active" : ""}`}
          >
            {c}
          </Link>
        );
      })}
    </div>
  );
}
