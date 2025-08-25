// src/app/api/check-status/route.ts

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { URLSearchParams } from 'url';

async function sendSuccessNotification(data: any) {
    const { invoiceId, grandTotal, productName, customerDetails } = data;
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

    const message = `
✅ *Pembayaran LUNAS*

**Invoice:** \`${invoiceId}\`
**Total:** Rp ${Number(grandTotal).toLocaleString('id-ID')}

---
*Produk:*
- Nama: ${productName}

---
*Data Pelanggan:*
- Nama: ${customerDetails.firstName} ${customerDetails.lastName}
- Email: ${customerDetails.email}
- HP: ${customerDetails.phone}
- Alamat: ${customerDetails.fullAddress}, ${customerDetails.district}, ${customerDetails.city}, ${customerDetails.province}
    `.trim();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }),
    });
}

export async function POST(request: Request) {
    try {
        const VIOLET_EMAIL = process.env.VIOLET_EMAIL;
        const VIOLET_PASSWORD = process.env.VIOLET_PASSWORD;
        if (!VIOLET_EMAIL || !VIOLET_PASSWORD) throw new Error("Kredensial login tidak ada.");

        const body = await request.json();
        // const { transactionId, merchantRef } = body;
        // if (!transactionId || !merchantRef) throw new Error("ID Transaksi atau Ref Merchant tidak ada.");
        const transactionId = "D1866725GPO2AD6PSJ7AC1T"; // ID Transaksi yang SUKSES
        const merchantRef = "4774416551694";
        // Tahap 1 & 2: Login (wajib dilakukan setiap kali cek)
        const loginPageResponse = await fetch("https://violetmediapay.com/login");
        const loginPageHtml = await loginPageResponse.text();
        const initialCookies = loginPageResponse.headers.get('set-cookie');
        const $loginPage = cheerio.load(loginPageHtml);
        const csrfTokenLogin = $loginPage('input[name="csrf_token"]').val();
        if (!initialCookies || !csrfTokenLogin) throw new Error("Gagal mendapatkan data login awal.");

        const loginResponse = await fetch("https://violetmediapay.com/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': initialCookies },
            body: new URLSearchParams({ csrf_token: csrfTokenLogin, username: VIOLET_EMAIL, password: VIOLET_PASSWORD, login: '' }),
            redirect: 'manual'
        });
        const finalCookies = loginResponse.headers.get('set-cookie') || initialCookies;
        if (loginResponse.status !== 302 || loginResponse.headers.get('location')?.includes('/login')) {
            throw new Error("Login gagal saat cek status.");
        }
        
        // Tahap 3: Kunjungi halaman riwayat transaksi
        const historyPageResponse = await fetch("https://violetmediapay.com/transaksi/semua-transaksi", {
            headers: { 'Cookie': finalCookies }
        });
        const historyPageHtml = await historyPageResponse.text();
        const $ = cheerio.load(historyPageHtml);

        let status = 'pending';

        // Cari baris tabel yang mengandung ID Transaksi dan Ref Merchant yang kita cari
        const targetRow = $(`td:contains("${transactionId}")`).filter((i, el) => {
            return $(el).parent().text().includes(merchantRef);
        }).parent(); // .parent() untuk mendapatkan elemen <tr>

        if (targetRow.length > 0) {
            // Jika baris ditemukan, cek apakah ada badge success di dalamnya
            if (targetRow.find('span.bg-success').length > 0) {
                status = 'success';
                // Kirim notifikasi LUNAS ke Telegram
                await sendSuccessNotification(body.fullOrderData);
            }
        }
        
        return NextResponse.json({ status });

    } catch (error: any) {
        console.error("Error saat cek status:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}