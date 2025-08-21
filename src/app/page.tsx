import Link from "next/link";
import { products } from "@/data/products";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Koleksi Baju <span className="text-indigo-600">Avrellewear</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Temukan gaya terbaikmu dari koleksi kami. Semua baju tersedia dengan kualitas premium.
        </p>
      </section>

      {/* Product Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Produk Terbaru</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const cover = p.images?.[0]; // ← pakai foto pertama
            return (
              <div key={p.id} className="card card-hover overflow-hidden flex flex-col">
                <div className="aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-700/40">
                  {cover ? (
                    <img
                      src={cover}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-lg mb-1">{p.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{p.price}</p>
                  </div>
                  <Link
                    href={`/produk/${p.id}`}
                    className="mt-4 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium text-center transition"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
