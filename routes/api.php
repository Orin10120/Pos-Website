<?php

use App\Http\Controllers\NotificationHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Webhook notifikasi pembayaran Xendit (tanpa CSRF, dipanggil oleh server Xendit)
Route::post('/xendit/notification', [NotificationHandler::class, 'paymentNotification']);
