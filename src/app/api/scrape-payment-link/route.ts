// src/app/api/scrape-payment-link/route.ts

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { URLSearchParams } from 'url';

export async function POST(request: Request) {
  try {
    const VIOLET_EMAIL = process.env.VIOLET_EMAIL;
    const VIOLET_PASSWORD = process.env.VIOLET_PASSWORD;

    if (!VIOLET_EMAIL || !VIOLET_PASSWORD) {
      throw new Error("Kredensial login VioletmediaPay belum diatur di .env.local");
    }

    const orderDetails = await request.json();
    
    // Tahap 1: Kunjungi halaman login untuk dapat cookie & CSRF awal
    console.log("Tahap 1: Mengunjungi halaman login...");
    const loginPageResponse = await fetch("https://violetmediapay.com/login");
    const loginPageHtml = await loginPageResponse.text();
    const cookies = loginPageResponse.headers.get('set-cookie');
    const $loginPage = cheerio.load(loginPageHtml);
    const csrfTokenLogin = $loginPage('input[name="csrf_token"]').val();

    if (!cookies || !csrfTokenLogin) {
        throw new Error("Gagal mendapatkan cookie atau CSRF dari halaman login.");
    }
    console.log("Berhasil mendapatkan cookie awal dan CSRF token.");

    // Tahap 2: Lakukan Login
    console.log("Tahap 2: Mengirim data login...");
    const loginResponse = await fetch("https://violetmediapay.com/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies
        },
        body: new URLSearchParams({
            csrf_token: csrfTokenLogin,
            username: VIOLET_EMAIL,
            password: VIOLET_PASSWORD,
            login: ''
        }),
        redirect: 'manual'
    });

    const redirectUrl = loginResponse.headers.get('location');
    const finalCookies = loginResponse.headers.get('set-cookie') || cookies;

    console.log(`Login attempt selesai. Status: ${loginResponse.status}. Redirect ke: ${redirectUrl}`);

    // --- LOGIKA PENGECEKAN BARU ---
    // Anggap berhasil jika status 302 (redirect) dan TIDAK kembali ke halaman /login
    if (loginResponse.status !== 302 || redirectUrl?.includes('/login')) {
        throw new Error(`Login gagal. Server mengalihkan ke ${redirectUrl}. Periksa kembali kredensial Anda.`);
    }
    console.log("Login Berhasil! Mendapatkan sesi yang valid.");

    // Tahap 3: Langsung kunjungi halaman payment link
    console.log("Tahap 3: Mengambil halaman form payment link...");
    const formPageResponse = await fetch("https://violetmediapay.com/transaksi/payment-link", {
        headers: { 'Cookie': finalCookies }
    });
    const formPageHtml = await formPageResponse.text();
    const $formPage = cheerio.load(formPageHtml);
    const csrfTokenForm = $formPage('input[name="csrf_token"]').val();

    if (!csrfTokenForm) {
        throw new Error("Gagal mendapatkan CSRF token dari halaman payment link. Mungkin sesi login tidak valid.");
    }
    console.log("Berhasil mendapatkan CSRF Token untuk form:", csrfTokenForm);

    // Tahap 4: Kirim form untuk buat payment link
    console.log("Tahap 4: Mengirim form untuk membuat link pembayaran...");
    const createLinkBody = new URLSearchParams({
        csrf_token: csrfTokenForm,
        metode: "QRIS",
        jumlah: orderDetails.totalPrice,
        pembeli: `${orderDetails.customerDetails.firstName} ${orderDetails.customerDetails.lastName}`,
        email: orderDetails.customerDetails.email,
        nohp: orderDetails.customerDetails.phone,
        produk: orderDetails.product.name,
        create: ''
    });

    const createLinkResponse = await fetch("https://violetmediapay.com/transaksi/payment-link", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': finalCookies
        },
        body: createLinkBody
    });
    const resultPageHtml = await createLinkResponse.text();
    
    // Tahap 5: Ambil URL dari halaman hasil
    console.log("Tahap 5: Mem-parsing halaman hasil...");
    const $resultPage = cheerio.load(resultPageHtml);
    const paymentLink = $resultPage('#copyLinkInput').val();

    if (!paymentLink) {
        console.error("HTML Halaman Hasil (untuk debug):", resultPageHtml);
        throw new Error("Gagal menemukan URL payment link. Struktur HTML mungkin berubah.");
    }
    console.log("✅ BERHASIL! Payment link ditemukan:", paymentLink);

    return NextResponse.json({ paymentLink: paymentLink });

  } catch (error: any) {
    console.error("Error dalam proses scraping:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}