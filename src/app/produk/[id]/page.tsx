import { notFound } from "next/navigation";
import Link from "next/link";
import { products } from "@/data/products";
import ImageSlider from "@/components/ImageSlider";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const p = products.find((x) => x.id === Number(id));
  if (!p) return { title: "Produk tidak ditemukan" };
  return {
    title: `${p.name} | Avrellewear`,
    description: `Detail ${p.name}`,
    openGraph: { images: p.images?.length ? [p.images[0]] : [] },
  };
}

export default async function ProductDetail({ params }: PageProps) {
  const { id } = await params;
  const p = products.find((x) => x.id === Number(id));
  if (!p) return notFound();

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Gallery with slider */}
      <div className="card p-3">
        <ImageSlider images={p.images ?? []} alt={p.name} />
      </div>

      {/* Info */}
      <div className="lg:sticky lg:top-20 h-fit">
        <div className="card p-6 space-y-4">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{p.category}</div>
            <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
          </div>

          <div className="text-2xl font-semibold">{p.price}</div>

          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Bahan nyaman untuk aktivitas harian. Potongan modern cocok untuk Gen Z.</p>
            <p>Foto dummy dari Unsplash (acak per keyword).</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              ← Kembali
            </Link>
            <button className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-800">
              Tambah ke Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
