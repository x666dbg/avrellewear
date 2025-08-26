// src/app/api/scrape-payment-link/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const SAKURUPIAH_API_ID = process.env.SAKURUPIAH_API_ID;
        const SAKURUPIAH_API_KEY = process.env.SAKURUPIAH_API_KEY;
        const SAKURUPIAH_BASE_URL = "https://sakurupiah.id/api-sanbox";
        
        if (!SAKURUPIAH_API_ID || !SAKURUPIAH_API_KEY) {
            throw new Error("Kredensial API Sakurupiah belum diatur.");
        }

        const orderDetails = await request.json();
        const { product, totalPrice, customerDetails, selectedSize } = orderDetails;

        const basePrice = totalPrice;
        const merchantRef = `AVRW-${product.id}-${Date.now()}`;
        const amount = String(basePrice);
        const expired = "24"; // 24 hours expiry
        const callback_url = process.env.SAKURUPIAH_CALLBACK_URL || "http://localhost:3000/api/sakurupiah-callback";
        const return_url = `${request.headers.get('origin')}/invoice/${merchantRef}`;

        // Buat string untuk signature sesuai contoh PHP: api_id + method + merchant_ref + amount
        const stringForSignature = `${SAKURUPIAH_API_ID}QRIS${merchantRef}${amount}`;

        const signature = crypto.createHmac('sha256', SAKURUPIAH_API_KEY)
                                 .update(stringForSignature)
                                 .digest('hex');

        const formData = new URLSearchParams();
        formData.append('api_id', SAKURUPIAH_API_ID);
        formData.append('method', 'QRIS');
        formData.append('name', `${customerDetails.firstName} ${customerDetails.lastName}`);
        formData.append('email', customerDetails.email);
        formData.append('phone', customerDetails.phone);
        formData.append('amount', amount);
        formData.append('merchant_fee', '2'); // Tanggung oleh pembeli
        formData.append('merchant_ref', merchantRef);
        formData.append('expired', expired);
        formData.append('produk[]', product.name);
        formData.append('qty[]', '1');
        formData.append('harga[]', amount);
        formData.append('size[]', selectedSize || 'N/A');
        formData.append('callback_url', callback_url);
        formData.append('return_url', return_url);
        formData.append('signature', signature);

        const response = await fetch(`${SAKURUPIAH_BASE_URL}/create.php`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SAKURUPIAH_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });
        
        const data = await response.json();
        console.log("Sakurupiah API Response:", data);

        // Check if the response status is '200' (string) not the status code of the HTTP request
        if (data.status !== '200') {
            throw new Error(data.message || 'Gagal membuat invoice Sakurupiah.');
        }
        
        // Extracting data from the nested `data` array
        const paymentData = data.data[0];
        const expiryTimestamp = new Date(paymentData.expired).getTime();
        
        return NextResponse.json({
            success: true,
            invoiceId: paymentData.invoice_id,
            qrCodeUrl: paymentData.qr_url,
            grandTotal: paymentData.total,
            basePrice: paymentData.amount_merchant,
            adminFee: paymentData.fee,
            productName: data.produk[0].nama_produk,
            transactionId: paymentData.trx_id,
            merchantRef: paymentData.merchant_ref,
            customerDetails: customerDetails,
            expiryTimestamp: expiryTimestamp,
        });

    } catch (error: any) {
        console.error("Error creating payment link:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}