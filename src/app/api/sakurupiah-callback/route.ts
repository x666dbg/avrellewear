import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  console.log('Received Sakurupiah callback:', data);

  // Logika Anda untuk memproses notifikasi, misalnya memperbarui database
  // if (data.status === 'berhasil') {
  //   // Lakukan sesuatu, misalnya:
  //   // updateTransactionStatus(data.merchant_ref, 'success');
  // }

  return NextResponse.json({ message: 'Callback received successfully' });
}