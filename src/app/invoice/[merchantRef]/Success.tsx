// src/app/invoice/[merchantRef]/Success.tsx

import { CheckCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';
import Link from 'next/link';

const SuccessView = ({ invoiceId }: { invoiceId: string }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6 md:p-8 text-center space-y-6">
        <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <CheckCircleIcon className="w-8 h-8 text-green-500 dark:text-green-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-green-500 dark:text-green-400">Pembayaran Berhasil!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Pesanan Anda dengan nomor invoice <span className="font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded">{invoiceId}</span> telah lunas.</p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Kami sudah menerima pesanan Anda dan akan segera memprosesnya. Terima kasih telah berbelanja!</p>
        <Link href="/" className="w-full mt-4 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default SuccessView;