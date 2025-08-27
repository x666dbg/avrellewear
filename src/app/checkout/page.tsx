"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";
import { formatIDR } from "@/lib/currency";
import AddressCascader from "@/components/AddressCascader";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const product = products.find((p) => p.id === Number(productId));

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantityStr, setQuantityStr] = useState("1");
  const quantity = Math.max(1, parseInt(quantityStr || "1", 10));
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    fullAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return product.price * quantity;
  }, [product, quantity]);

  const handleInputChange = useCallback((
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      setError("Silakan pilih ukuran terlebih dahulu.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const qty = Math.max(1, parseInt(quantityStr || "1", 10));

      const response = await fetch("/api/scrape-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          totalPrice,
          customerDetails: formData,
          selectedSize,
          quantity: qty,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Gagal membuat invoice.");

      const expiryTimestamp = data.expiryTimestamp;

      sessionStorage.setItem("avrelleInvoice", JSON.stringify(data));

      const params = new URLSearchParams({
        qr: data.qrCodeUrl,
        product: data.productName,
        expiry: String(expiryTimestamp),
        price: String(data.basePrice),
        fee: String(data.adminFee),
        total: String(data.grandTotal),
        txId: data.transactionId,
        ref: data.merchantRef,
        cust: JSON.stringify(data.customerDetails),
      });

      router.push(`/invoice/${data.merchantRef}?${params.toString()}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="text-center py-24">
        <h1 className="text-3xl font-bold">Produk tidak ditemukan.</h1>
        <Link href="/" className="underline mt-4 inline-block">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const sizes: (keyof typeof product.stock)[] = ["S", "M", "L", "XL"];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Detail Pengiriman</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-4 space-y-4 h-fit sticky top-24">
          <h3 className="font-semibold text-lg">Ringkasan Pesanan</h3>
          <div className="flex gap-4">
            <div className="relative aspect-square w-24 h-24">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div>
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-sm text-slate-500">Ukuran: {selectedSize || "-"}</p>
              <p className="text-sm text-slate-500">Jumlah: {quantity}</p>
            </div>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold">Total</span>
            <span className="font-bold">{formatIDR(totalPrice)}</span>
          </div>
        </div>

        {/* Kanan: Form */}
        <div className="card p-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">1. Pilih Opsi Produk</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                <div>
                  <label className="text-xs font-medium">Ukuran*</label>
                  <div className="flex gap-2 mt-1">
                    {sizes.map((size) => {
                      const stock = product.stock[size];
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => stock > 0 && setSelectedSize(size)}
                          disabled={stock === 0}
                          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            selectedSize === size
                              ? "border-slate-900 bg-slate-900 text-white dark:border-sky-500 dark:bg-sky-500"
                              : "border-neutral-300 dark:border-neutral-700"
                          } ${
                            stock === 0
                              ? "opacity-30 cursor-not-allowed line-through"
                              : "hover:border-slate-500 dark:hover:border-slate-400"
                          }`}
                        >
                          {size} <span className="text-xs opacity-70">({stock})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Jumlah*</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={quantityStr}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "");
                      setQuantityStr(onlyDigits);
                    }}
                    onBlur={() => {
                      if (!quantityStr || quantityStr === "0") {
                        setQuantityStr("1");
                      } else {
                        setQuantityStr(String(parseInt(quantityStr, 10)));
                      }
                    }}
                    className="ui-input mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">2. Isi Data Penerima</h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    placeholder="Nama Depan*"
                    required
                    className="ui-input"
                    onChange={handleInputChange}
                  />
                  <input
                    name="lastName"
                    placeholder="Nama Belakang*"
                    required
                    className="ui-input"
                    onChange={handleInputChange}
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Alamat Email*"
                  required
                  className="ui-input"
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nomor HP (WhatsApp)*"
                  required
                  className="ui-input"
                  onChange={handleInputChange}
                />

                <AddressCascader
                  disabled={loading}
                  onFieldChange={handleInputChange}
                />

                <input
                  name="postalCode"
                  placeholder="Kode Pos*"
                  required
                  inputMode="numeric"
                  pattern="\d{5}"
                  title="Masukkan 5 digit kode pos"
                  className="ui-input"
                  onChange={handleInputChange}
                />

                <textarea
                  name="fullAddress"
                  placeholder="Alamat Lengkap (Nama jalan, nomor rumah, RT/RW, kelurahan)*"
                  required
                  className="ui-input min-h-[80px]"
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !selectedSize}
              className="w-full mt-4 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Lanjutkan ke Pembayaran"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
