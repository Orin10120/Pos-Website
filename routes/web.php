<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Admin\DashboardController;


Route::get('/', function () {
    return \Illuminate\Support\Facades\Auth::check()
        ? redirect()->route('admin.dashboard')
        : redirect()->to('/login');
});


Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'index'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
});

Route::post('/logout', [LogoutController::class, '__invoke'])
    ->middleware('auth')
    ->name('logout');

 Route::prefix('admin')->middleware('auth')->name('admin.')->group(function () {
    Route::get('/dashboard', DashboardController::class)
        ->name('dashboard');
});
