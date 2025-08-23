import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryPills from "@/components/CategoryPills";
import Search from "@/components/Search";
import { products } from "@/data/products";

export const revalidate = false;
type PageProps = { searchParams: Promise<{ cat?: string; q?: string }> };

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cat = sp?.cat?.trim();
  const q = sp?.q?.trim()?.toLowerCase();

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filtered = products
    .filter(p => (cat ? p.category === cat : true))
    .filter(p => (q ? (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : true));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="card p-6 md:p-8 mt-8 md:mt-12">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Daily fits for Gen Z.</h1>
            {/* Ikuti default (light=hitam, dark=putih) */}
            <p className="mt-2">
              Minimal, clean, dan siap dipakai sehari-hari. Temukan outfit favoritmu dari koleksi Avrellewear.
            </p>
            <div className="mt-4">
              <Search placeholder="Cari: hoodie, tee, denim..." />
            </div>
            <div className="mt-4">
              <CategoryPills categories={categories} active={cat} />
            </div>
          </div>
          <div className="hidden md:block">
            <div className="aspect-[5/3] w-full rounded-xl bg-gradient-to-br from-neutral-100 via-white to-neutral-100 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-800" />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Produk</h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{filtered.length} item</span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-neutral-500 dark:text-neutral-400">
            Produk tidak ditemukan. Coba kata kunci/kategori lain.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <Link key={p.id} href={`/produk/${p.id}`} className="block">
                <ProductCard image={p.images?.[0]} title={p.name} meta={p.category} price={p.price} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
