// src/app/invoice/[merchantRef]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation'; // Tambahkan useSearchParams dan useParams
import Link from 'next/link'; // Tambahkan import Link
import Image from 'next/image'; // Tambahkan import Image
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import SuccessView from './Success';

// Komponen Countdown Timer
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

export default function InvoicePage() {
    const searchParams = useSearchParams();
    const params = useParams();
    
    const invoiceId = typeof params.merchantRef === 'string' ? params.merchantRef : '';

    const [status, setStatus] = useState('pending');
    
    const qrCodeUrl = searchParams.get('qr');
    const productName = searchParams.get('product');
    const expiry = searchParams.get('expiry');
    const basePrice = searchParams.get('price');
    const adminFee = searchParams.get('fee');
    const grandTotal = searchParams.get('total');
    const transactionId = searchParams.get('txId');
    const customerDetails = searchParams.get('cust');

    useEffect(() => {
        if (status !== 'pending' || !transactionId || !invoiceId) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/check-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transactionId,
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

        return () => clearInterval(interval);
    }, [status, transactionId, invoiceId, grandTotal, productName, customerDetails]);
    
    if (status === 'success') {
        if (!invoiceId) return <div className="text-center py-24">Memuat data keberhasilan...</div>;
        return <SuccessView invoiceId={invoiceId} />;
    }

    if (!qrCodeUrl || !grandTotal || !expiry) {
        return <div className="text-center py-24 text-slate-500 dark:text-slate-400">... memuat data invoice ...</div>;
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