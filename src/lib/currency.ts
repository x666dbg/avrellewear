export function formatIDR(centsOrRupiah: number) {
  // Di data kita pakai rupiah langsung (contoh 149900), jadi tidak dibagi 100.
  return (centsOrRupiah).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}
