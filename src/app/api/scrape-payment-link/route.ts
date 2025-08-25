// src/app/api/scrape-payment-link/route.ts

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { URLSearchParams } from 'url';

export async function POST(request: Request) {
  try {
    const VIOLET_EMAIL = process.env.VIOLET_EMAIL;
    const VIOLET_PASSWORD = process.env.VIOLET_PASSWORD;

    if (!VIOLET_EMAIL || !VIOLET_PASSWORD) {
      throw new Error("Kredensial login VioletmediaPay belum diatur.");
    }

    const orderDetails = await request.json();
    const { product, totalPrice, customerDetails } = orderDetails;
    
    // ... (Kode Kalkulasi Biaya, Login, dan Membuat Payment Link tetap sama) ...
    const basePrice = totalPrice;
    const adminFeePercentage = basePrice * 0.007;
    const adminFeeFixed = 500;
    const totalAdminFee = Math.floor(adminFeePercentage + adminFeeFixed);
    const grandTotal = basePrice + totalAdminFee;

    const loginPageResponse = await fetch("https://violetmediapay.com/login");
    const loginPageHtml = await loginPageResponse.text();
    const initialCookies = loginPageResponse.headers.get('set-cookie');
    const $loginPage = cheerio.load(loginPageHtml);
    const csrfTokenLogin = $loginPage('input[name="csrf_token"]').val();
    if (!initialCookies || !csrfTokenLogin) throw new Error("Gagal mendapatkan data awal dari halaman login.");

    const loginResponse = await fetch("https://violetmediapay.com/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': initialCookies },
        body: new URLSearchParams({ csrf_token: csrfTokenLogin, username: VIOLET_EMAIL, password: VIOLET_PASSWORD, login: '' }),
        redirect: 'manual'
    });
    const finalCookies = loginResponse.headers.get('set-cookie') || initialCookies;
    if (loginResponse.status !== 302 || loginResponse.headers.get('location')?.includes('/login')) {
        throw new Error("Login gagal. Periksa kembali kredensial Anda.");
    }
    console.log("Login Berhasil.");

    const formPageResponse = await fetch("https://violetmediapay.com/transaksi/payment-link", { headers: { 'Cookie': finalCookies } });
    const formPageHtml = await formPageResponse.text();
    const $formPage = cheerio.load(formPageHtml);
    const csrfTokenForm = $formPage('input[name="csrf_token"]').val();
    if (!csrfTokenForm) throw new Error("Gagal mendapatkan CSRF token dari halaman form.");

    const createLinkBody = new URLSearchParams({
        csrf_token: csrfTokenForm,
        metode: "QRIS",
        jumlah: String(basePrice),
        pembeli: `${customerDetails.firstName} ${customerDetails.lastName}`,
        email: customerDetails.email,
        nohp: customerDetails.phone,
        produk: product.name,
        create: ''
    });

    const createLinkResponse = await fetch("https://violetmediapay.com/transaksi/payment-link", {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': finalCookies },
        body: createLinkBody
    });
    const resultPageHtml = await createLinkResponse.text();
    const $resultPage = cheerio.load(resultPageHtml);
    const paymentLinkValue = $resultPage('#copyLinkInput').val();
    if (typeof paymentLinkValue !== 'string' || !paymentLinkValue) {
        throw new Error("Gagal menemukan URL payment link di halaman hasil.");
    }
    const paymentLink = paymentLinkValue;
    console.log("Berhasil mendapatkan payment link:", paymentLink);

    // --- TAHAP 5: Mengunjungi Payment Link untuk mengambil detail ---
    console.log("Tahap 5: Mengunjungi payment link untuk mengambil detail...");
    const invoicePageResponse = await fetch(paymentLink, { headers: { 'Cookie': finalCookies } });
    const invoicePageHtml = await invoicePageResponse.text();
    const $invoicePage = cheerio.load(invoicePageHtml);

    const qrCodeUrl = $invoicePage('img#myImg').attr('src');
    
    // --- PERBAIKAN DENGAN SELECTOR YANG AKURAT ---
    const printLink = $invoicePage('a[href*="print-invoice.php"]').attr('href');
    const transactionId = printLink ? new URL(printLink, "https://violetmediapay.com").searchParams.get('redID') : null;
    const merchantRef = $invoicePage('input#refid').val();
    
    if (!qrCodeUrl || !transactionId || !merchantRef) {
        console.error("HTML Halaman Invoice (untuk debug):", invoicePageHtml);
        throw new Error(`Gagal mengekstrak detail. QR: ${!!qrCodeUrl}, TxID: ${transactionId}, Ref: ${merchantRef}`);
    }
    console.log(`Detail ditemukan: ID Transaksi=${transactionId}, Ref Merchant=${merchantRef}`);
    
    const invoiceId = `AVRL-${product.id}-${Date.now()}`;

    return NextResponse.json({
        success: true,
        invoiceId: invoiceId,
        qrCodeUrl: qrCodeUrl,
        basePrice,
        adminFee: totalAdminFee,
        grandTotal,
        productName: product.name,
        transactionId,
        merchantRef,
        customerDetails
    });

  } catch (error: any) {
    console.error("Error dalam proses scraping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}