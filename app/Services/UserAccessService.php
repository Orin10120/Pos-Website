<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;

class UserAccessService
{

    /**
     * Dapatkan store_id user yang login
     */
    public function getStoreId(): ?int
    {
        return Auth::user()->store_id ?? null;
    }

    /**
     * Cek apakah user adalah admin
     */
    public function isAdmin(): bool
    {
        return Auth::user()->hasRole('admin');
    }

    /**
     * Mendapatkan ID user yang sedang login.
     */
    public function getUserId(): int
    {
        return Auth::user()->id;
    }
}
