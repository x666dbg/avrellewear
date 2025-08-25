"use client";

import { useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Komponen Countdown Timer (diperbaiki sedikit)
const CountdownTimer = ({ expiryTimestamp, onExpire }: { expiryTimestamp: number, onExpire: () => void }) => {
    const calculateTimeLeft = () => {
        const difference = expiryTimestamp - new Date().getTime();
        let timeLeft = { minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const isExpired = timeLeft.minutes <= 0 && timeLeft.seconds <= 0;

    useEffect(() => {
        if (isExpired) {
            onExpire();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, isExpired, onExpire]);

    return (
        <div className={`font-mono text-2xl font-bold ${isExpired ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
            {isExpired ? "Waktu Habis" : `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
        </div>
    );
};

// Tampilan "Pembayaran Berhasil"
const SuccessView = ({ invoiceId }: { invoiceId: string }) => (
    <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold text-green-500">Pembayaran Berhasil!</h2>
        <p>Pesanan Anda dengan nomor invoice <span className="font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded">{invoiceId}</span> telah lunas.</p>
        <p>Kami sudah menerima pesanan Anda dan akan segera memprosesnya. Terima kasih telah berbelanja!</p>
        <Link href="/" className="inline-block mt-6 text-sky-500 hover:underline">
            ← Kembali ke Beranda
        </Link>
    </div>
);


export default function InvoicePage() {
    const searchParams = useSearchParams();
    const params = useParams();
    
    // PERBAIKAN: Dapatkan invoiceId dan pastikan tipenya string
    const invoiceId = typeof params.invoiceId === 'string' ? params.invoiceId : '';

    const [status, setStatus] = useState('pending'); // 'pending', 'success', 'expired'
    
    // Ambil semua data dari URL
    const qrCodeUrl = searchParams.get('qr');
    const productName = searchParams.get('product');
    const expiry = searchParams.get('expiry');
    const basePrice = searchParams.get('price');
    const adminFee = searchParams.get('fee');
    const grandTotal = searchParams.get('total');
    const transactionId = searchParams.get('txId');
    const merchantRef = searchParams.get('ref');
    const customerDetails = searchParams.get('cust');

    useEffect(() => {
        if (status !== 'pending' || !transactionId || !merchantRef) return;

        // Mulai polling setiap 7 detik
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/check-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        transactionId, 
                        merchantRef,
                        // Kirim semua data pesanan untuk notifikasi Telegram
                        fullOrderData: {
                            invoiceId,
                            grandTotal,
                            productName,
                            customerDetails: JSON.parse(customerDetails || '{}')
                        }
                    }),
                });
                const data = await response.json();
                if (data.status === 'success') {
                    setStatus('success');
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 7000);

        // Hentikan polling jika user meninggalkan halaman atau status berubah
        return () => clearInterval(interval);
    }, [status, transactionId, merchantRef, invoiceId, grandTotal, productName, customerDetails]);
    
    // PERBAIKAN: Pindahkan pengecekan invoiceId ke sini agar komponen SuccessView aman
    if (status === 'success') {
        if (!invoiceId) return <div className="text-center py-24">Memuat data keberhasilan...</div>;
        return <SuccessView invoiceId={invoiceId} />;
    }

    if (!qrCodeUrl || !grandTotal || !expiry) {
        return <div className="text-center py-24">... memuat data invoice ...</div>;
    }

    const expiryTimestamp = Number(expiry);

    return (
        <div className="max-w-md mx-auto">
            <div className="card p-6 md:p-8 text-center space-y-6">
                {status === 'expired' ? (
                     <div>
                        <h1 className="text-2xl font-bold tracking-tight text-red-500">Invoice Kedaluwarsa</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Waktu pembayaran untuk invoice ini telah habis. Silakan buat pesanan baru.</p>
                        <Link href="/" className="inline-block mt-6 text-sky-500 hover:underline">
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                ) : (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Menunggu Pembayaran</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Selesaikan pembayaran dalam</p>
                            <div className="mt-2">
                                <CountdownTimer expiryTimestamp={expiryTimestamp} onExpire={() => setStatus('expired')} />
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                             <Image src={qrCodeUrl} alt="QRIS Payment Code" width={280} height={280} unoptimized />
                        </div>
                        
                        <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-2 text-left">
                            <div className="flex justify-between text-sm">
                               <span className="text-slate-500">Produk</span>
                               <span className="font-medium">{productName}</span>
                           </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-slate-500">Nominal</span>
                               <span>Rp {Number(basePrice).toLocaleString('id-ID')}</span>
                           </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-slate-500">Biaya Admin</span>
                               <span>Rp {Number(adminFee).toLocaleString('id-ID')}</span>
                           </div>
                           <hr className="border-slate-200 dark:border-slate-700 !my-3"/>
                           <div className="flex justify-between font-bold text-lg">
                               <span>Total Pembayaran</span>
                               <span>Rp {Number(grandTotal).toLocaleString('id-ID')}</span>
                           </div>
                        </div>
                         <div className="pt-4">
                             <p className="text-xs text-slate-400">Setelah membayar, halaman ini akan diperbarui secara otomatis. Anda tidak perlu melakukan apa-apa.</p>
                         </div>
                    </>
                )}
            </div>
        </div>
    );
}