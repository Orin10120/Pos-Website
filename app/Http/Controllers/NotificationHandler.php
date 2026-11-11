<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationHandler extends Controller
{
    /**
     * Webhook notifikasi pembayaran dari Xendit (Invoice API v2).
     * Didaftarkan sebagai POST /api/xendit/notification
     */
    public function paymentNotification(Request $request)
    {
        // 1. Verifikasi token callback Xendit.
        //    Xendit mengirim token pada header "x-callback-token"
        //    (Xendit Dashboard -> Settings -> Developers -> Callbacks).
        $expectedToken = config('services.xendit.token_webhook');
        $receivedToken = $request->header('x-callback-token');

        if (empty($expectedToken) || ! hash_equals((string) $expectedToken, (string) $receivedToken)) {
            return response()->json(['message' => 'Invalid callback token'], 403);
        }

        $payload = $request->json()->all();

        // 2. Xendit bisa mengirim 2 format payload:
        //    a. Objek invoice langsung: { external_id, status, paid_amount, ... }
        //    b. Format event: { event: "invoice.paid", data: { ... } }
        if (isset($payload['event']) && isset($payload['data']) && is_array($payload['data'])) {
            $payload = $payload['data'];
        }

        $externalId = $payload['external_id'] ?? null;
        $status = strtoupper($payload['status'] ?? '');

        if (empty($externalId) || empty($status)) {
            return response()->json(['message' => 'Payload tidak lengkap'], 200);
        }

        // 3. Cari transaksi berdasarkan external_id (= nomor invoice Anda)
        $transaction = Transaction::where('invoice', $externalId)->first();

        if (! $transaction) {
            Log::warning('Xendit webhook: transaksi tidak ditemukan', ['external_id' => $externalId]);

            return response()->json(['message' => 'Transaction not found'], 200);
        }

        // 4. Validasi nominal pembayaran (hanya saat status sudah lunas).
        //    Mencegah status "success" padahal nominal yang dibayar tidak sesuai.
        if (in_array($status, ['PAID', 'SETTLED'], true)) {
            $expectedAmount = max(0, (float) $transaction->total_amount - (float) $transaction->discount);
            $paidAmount = (float) ($payload['paid_amount'] ?? $payload['amount'] ?? 0);

            if ($paidAmount < $expectedAmount) {
                Log::error('Xendit webhook: nominal pembayaran tidak sesuai', [
                    'external_id' => $externalId,
                    'expected' => $expectedAmount,
                    'paid' => $paidAmount,
                ]);

                return response()->json(['message' => 'Amount mismatch'], 422);
            }
        }

        // 5. Mapping status Xendit -> status transaksi di database
        $newStatus = match ($status) {
            'PAID', 'SETTLED' => 'success',
            'PENDING' => 'pending',
            'EXPIRED' => 'expired',
            'FAILED', 'CANCELLED' => 'failed',
            default => null,
        };

        if ($newStatus === null) {
            Log::info('Xendit webhook: status tidak dikenal, diabaikan', ['status' => $status]);

            return response()->json(['message' => 'Status ignored'], 200);
        }

        // 6. Cegah penurunan status akibat webhook yang datang terlambat
        //    (misal webhook PENDING setelah transaksi sudah SUCCESS).
        if ($transaction->status === 'success' && $newStatus !== 'success') {
            return response()->json(['message' => 'Status already final'], 200);
        }

        $transaction->update([
            'status' => $newStatus,
            'payment_method' => 'online',
        ]);

        return response()->json(['message' => 'OK'], 200);
    }
}
