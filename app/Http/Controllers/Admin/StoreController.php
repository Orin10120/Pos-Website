<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\Warehouse;
use App\Models\City;
use App\Models\Province;
use Illuminate\Http\Request;
use App\Services\UserAccessService;

class StoreController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    /**
     * Menampilkan daftar toko
     */
    public function index()
    {
        $isAdmin = $this->userAccessService->isAdmin();
        $storeId = $this->userAccessService->getStoreId();

        $stores = Store::with(['province', 'city', 'warehouses'])
            ->when(!$isAdmin, function ($query) use ($storeId) {
                $query->where('id', $storeId);
            })
            ->when(request()->q, function ($query) {
                return $query->where('name', 'like', '%' . request()->q . '%');
            })
            ->latest()
            ->paginate(5);

        return inertia('Admin/Stores/Index', [
            'stores' => $stores,
            'provinces' => Province::all(),
            'warehouses' => Warehouse::all(),
            'isAdmin' => $isAdmin,
        ]);
    }

    public function create()
    {
        $provinces = Province::all();
        $cities = [];
        $warehouses = Warehouse::all();

        return inertia('Admin/Stores/Create', [
            'provinces' => $provinces,
            'cities' => $cities,
            'warehouses' => $warehouses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'province_id' => 'required|exists:provinces,id',
            'city_id' => 'required|exists:cities,id',
            'warehouse_ids' => 'array|exists:warehouses,id',
        ]);

        $store = Store::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'province_id' => $validated['province_id'],
            'city_id' => $validated['city_id'],
        ]);

        if (isset($validated['warehouse_ids'])) {
            $store->warehouses()->sync($validated['warehouse_ids']);
        }

        return redirect()->route('admin.stores.index');
    }

    public function edit($id)
    {

        $store = Store::with('warehouses')->findOrFail($id);
        $provinces = Province::all();
        $cities = City::where('province_id', $store->province_id)->get();
        $warehouses = Warehouse::all();

        return inertia('Admin/Stores/Edit', [
            'store' => $store,
            'provinces' => $provinces,
            'cities' => $cities,
            'warehouses' => $warehouses,
        ]);
    }

    public function update(Request $request, Store $store)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'province_id' => 'required|exists:provinces,id',
            'city_id' => 'required|exists:cities,id',
            'warehouse_ids' => 'array|exists:warehouses,id',
        ]);

        $store->update([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'province_id' => $validated['province_id'],
            'city_id' => $validated['city_id'],
        ]);

        if (isset($validated['warehouse_ids'])) {
            $store->warehouses()->sync($validated['warehouse_ids']);
        }

        return redirect()->route('admin.stores.index');
    }

    public function destroy($id)
    {
        $store = Store::findOrFail($id);

        $store->delete();

        return redirect()->route('admin.stores.index');
    }
}
