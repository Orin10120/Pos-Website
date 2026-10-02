<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warehouse;
use App\Models\City;
use App\Models\Province;
use App\Services\UserAccessService;

class WarehouseController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    /**
     * Tampilkan daftar semua warehouse.
     */
    public function index()
    {
        $isAdmin = $this->userAccessService->isAdmin();
        $storeId = $this->userAccessService->getStoreId();

        $warehouses = Warehouse::with(['province', 'city', 'stores'])
            ->when(request()->q, function ($query) {
                return $query->where('name', 'like', '%' . request()->q . '%');
            })
            ->when(!$isAdmin, function ($query) use ($storeId) {
                $query->whereHas('stores', function ($q) use ($storeId) {
                    $q->where('store_id', $storeId);
                });
            })
            ->latest()
            ->paginate(5);

        $warehouses->appends(['q' => request()->q]);
        $provinces = Province::all();

        return inertia('Admin/Warehouses/Index', [
            'warehouses' => $warehouses,
            'provinces' => $provinces,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Tampilkan form untuk membuat warehouse baru.
     */
    public function create()
    {
        $provinces = Province::all();
        $cities = [];

        return inertia('Admin/Warehouses/Create', [
            'provinces' => $provinces,
            'cities' => $cities,
        ]);
    }

    /**
     * Simpan warehouse baru ke dalam database.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'province_id' => 'required|exists:provinces,id',
            'city_id' => 'required|exists:cities,id',
        ]);

        Warehouse::create($validated);

        return redirect()->route('admin.warehouses.index');
    }

    /**
     * Tampilkan form untuk mengedit warehouse tertentu.
     */
    public function edit($id)
    {
        $warehouse = Warehouse::findOrFail($id);
        $provinces = Province::all();
        $cities = City::where('province_id', $warehouse->province_id)->get();

        return inertia('Admin/Warehouses/Edit', [
            'warehouse' => $warehouse,
            'provinces' => $provinces,
            'cities' => $cities,
        ]);
    }

    /**
     * Perbarui data warehouse yang sudah ada di database.
     */
    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'province_id' => 'required|exists:provinces,id',
            'city_id' => 'required|exists:cities,id',
        ]);

        $warehouse->update($validated);

        return redirect()->route('admin.warehouses.index');
    }

    /**
     * Hapus warehouse dari database.
     */
    public function destroy($id)
    {

        $warehouse = Warehouse::findOrFail($id);
        $warehouse->delete();

        return redirect()->route('admin.warehouses.index');
    }

    /**
     * Ambil daftar kota berdasarkan ID provinsi.
     */
    public function getCitiesByProvince($provinceId)
    {
        return response()->json(City::where('province_id', $provinceId)->get());
    }
}
