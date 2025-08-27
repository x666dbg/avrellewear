// src/app/api/scrape-payment-link/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  fullAddress: string;
  postalCode: string;
};

type ProductPayload = {
  id: number;
  name: string;
  price?: number;
};

export async function POST(request: Request) {
  try {
    const SAKURUPIAH_API_ID = process.env.SAKURUPIAH_API_ID;
    const SAKURUPIAH_API_KEY = process.env.SAKURUPIAH_API_KEY;
    const SAKURUPIAH_BASE_URL = "https://sakurupiah.id/api-sanbox";

    if (!SAKURUPIAH_API_ID || !SAKURUPIAH_API_KEY) {
      throw new Error("Kredensial API Sakurupiah belum diatur.");
    }

    const body = (await request.json()) as {
      product: ProductPayload;
      totalPrice: number;
      customerDetails: CustomerDetails;
      selectedSize: string | null;
      quantity?: number;
    };

    if (!body?.product?.id || !body?.product?.name) {
      throw new Error("Data produk tidak valid.");
    }
    if (!body?.customerDetails?.firstName || !body?.customerDetails?.email) {
      throw new Error("Data pelanggan tidak lengkap.");
    }

    const product = body.product;
    const customerDetails = body.customerDetails;
    const selectedSize = body.selectedSize ?? null;

    const qty = Math.max(1, Number(body.quantity ?? 1));

    const inferredUnit =
      product.price && Number.isFinite(Number(product.price))
        ? Math.round(Number(product.price))
        : Math.round(Number(body.totalPrice ?? 0) / qty);

    if (!Number.isFinite(inferredUnit) || inferredUnit <= 0) {
      throw new Error("Harga satuan tidak valid.");
    }

    const basePrice = inferredUnit * qty;
    const amount = String(basePrice);

    const merchantRef = `AVRW-${product.id}-${Date.now()}`;
    const expired = "1"; // 1 jam
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const callback_url =
      process.env.SAKURUPIAH_CALLBACK_URL ||
      `${origin}/api/sakurupiah-callback`;
    const return_url = `${origin}/invoice/${merchantRef}`;

    // signature: api_id + method + merchant_ref + amount
    const stringForSignature = `${SAKURUPIAH_API_ID}QRIS${merchantRef}${amount}`;
    const signature = crypto
      .createHmac("sha256", SAKURUPIAH_API_KEY)
      .update(stringForSignature)
      .digest("hex");

    const formData = new URLSearchParams();
    formData.append("api_id", SAKURUPIAH_API_ID);
    formData.append("method", "QRIS");
    formData.append(
      "name",
      `${customerDetails.firstName} ${customerDetails.lastName}`.trim()
    );
    formData.append("email", customerDetails.email);
    formData.append("phone", customerDetails.phone);
    formData.append("amount", amount);
    formData.append("merchant_fee", "2"); // fee ditanggung pembeli
    formData.append("merchant_ref", merchantRef);
    formData.append("expired", expired);

    // Detail item
    formData.append(
      "produk[]",
      `${product.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`
    );
    formData.append("qty[]", String(qty));
    formData.append("harga[]", String(inferredUnit));

    formData.append("address", customerDetails.fullAddress);
    formData.append("province", customerDetails.province);
    formData.append("city", customerDetails.city);
    formData.append("district", customerDetails.district);
    formData.append("postal_code", customerDetails.postalCode);

    formData.append("callback_url", callback_url);
    formData.append("return_url", return_url);

    formData.append("signature", signature);

    const response = await fetch(`${SAKURUPIAH_BASE_URL}/create.php`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SAKURUPIAH_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log("Sakurupiah API Response:", data);

    if (data.status !== "200") {
      throw new Error(data.message || "Gagal membuat invoice Sakurupiah.");
    }

    const paymentData = data.data?.[0];
    if (!paymentData) {
      throw new Error("Data pembayaran tidak ditemukan pada respons gateway.");
    }

    const expiryTimestamp = new Date(paymentData.expired).getTime();

    return NextResponse.json({
      success: true,
      invoiceId: paymentData.invoice_id,
      qrCodeUrl: paymentData.qr_url,
      grandTotal: paymentData.total,
      basePrice: paymentData.amount_merchant,
      adminFee: paymentData.fee,
      productName:
        data.produk?.[0]?.nama_produk ??
        `${product.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      transactionId: paymentData.trx_id,
      merchantRef: paymentData.merchant_ref,
      customerDetails: { ...customerDetails },
      selectedSize,
      quantity: qty,
      expiryTimestamp,
    });
  } catch (error: any) {
    console.error("Error creating payment link:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
