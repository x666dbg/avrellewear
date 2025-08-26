import { NextResponse } from 'next/server';

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
        const SAKURUPIAH_API_ID = process.env.SAKURUPIAH_API_ID;
        const SAKURUPIAH_API_KEY = process.env.SAKURUPIAH_API_KEY;
        const SAKURUPIAH_BASE_URL = "https://sakurupiah.id/api-sanbox";

        if (!SAKURUPIAH_API_ID || !SAKURUPIAH_API_KEY) {
            throw new Error("Kredensial API Sakurupiah belum diatur.");
        }

        const body = await request.json();
        const { transactionId, fullOrderData } = body;
        if (!transactionId) {
            throw new Error("ID Transaksi tidak ada.");
        }

        const formData = new URLSearchParams();
        formData.append('api_id', SAKURUPIAH_API_ID);
        formData.append('method', 'status');
        formData.append('trx_id', transactionId);

        const response = await fetch(`${SAKURUPIAH_BASE_URL}/status-transaction.php`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SAKURUPIAH_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        const data = await response.json();
        console.log("Sakurupiah status response:", data);
        
        // Perbaikan: Cek `data.data[0].status` yang bernilai 'berhasil'
        if (data.data?.[0]?.status === 'berhasil') {
            await sendSuccessNotification(fullOrderData);
            return NextResponse.json({ status: 'success' });
        }
        
        return NextResponse.json({ status: 'pending' });

    } catch (error: any) {
        console.error("Error saat cek status:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}