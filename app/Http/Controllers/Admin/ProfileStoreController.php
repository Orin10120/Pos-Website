<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Services\UserAccessService;

class ProfileStoreController extends Controller
{
    protected $userAccessService;

    /**
     * Inisialisasi UserAccessService melalui konstruktor
     */
    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    /**
     * Menampilkan halaman create/edit profile store
     */
    public function createOrEdit()
    {
        $storeId = $this->userAccessService->getStoreId();
        $store = $storeId ? Store::find($storeId) : null;

        $warehouses = $storeId ? Warehouse::whereHas('stores', function ($query) use ($storeId) {
            $query->where('stores.id', $storeId);
        })->get() : [];

        return inertia('Admin/Profile/Store', [
            'store' => $store,
            'warehouses' => $warehouses,
            'user' => [
                'email' => Auth::user()->email,
                'role' => Auth::user()->getRoleNames()->first(),
            ],
        ]);
    }

    /**
     * Mengupdate password user yang login
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();
        $user->password = Hash::make($request->password);
        $user->save();

        Auth::logout();

        return redirect()->route('login');
    }

    /**
     * Menyimpan atau mengupdate data store
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
        ]);

        $storeId = $this->userAccessService->getStoreId();
        Store::updateOrCreate(
            ['id' => $storeId],
            [
                'name' => $request->name,
                'address' => $request->address,
            ]
        );

        return back();
    }
}
