import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Halaman tidak ditemukan.</p>
      <Link href="/" className="underline mt-4 inline-block">Kembali ke beranda</Link>
    </div>
  );
}
