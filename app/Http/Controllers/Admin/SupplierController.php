<?php

namespace App\Http\Controllers\Admin;

use App\Models\Supplier;
use App\Models\City;
use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRequest;
use App\Models\Province;
use App\Services\UserAccessService;

class SupplierController extends Controller
{
    private $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    /**
     * Tampilkan daftar semua supplier berdasarkan store_id (admin melihat semua).
     */
    public function index()
    {
        $user = auth()->user();

        $suppliers = Supplier::when(request()->q, function ($query) {
            return $query->where('name', 'like', '%' . request()->q . '%');
        })
            ->when(!$this->userAccessService->isAdmin(), function ($query) use ($user) {
                return $query->where('store_id', $user->store_id);
            })
            ->latest()
            ->paginate(5);

        $suppliers->appends(['q' => request()->q]);

        return inertia('Admin/Suppliers/Index', [
            'suppliers' => $suppliers
        ]);
    }

    /**
     * Tampilkan form untuk membuat supplier baru.
     */
    public function create()
    {
        return inertia('Admin/Suppliers/Create', [
            'provinces' => Province::all(),
            'cities' => [],
        ]);
    }

    /**
     * Simpan supplier baru ke dalam database (sesuai store_id user).
     */
    public function store(SupplierRequest $request)
    {
        $user = auth()->user();

        Supplier::create(array_merge(
            $request->validated(),
            ['store_id' => $user->store_id]
        ));

        return redirect()->route('admin.suppliers.index');
    }

    /**
     * Tampilkan form untuk mengedit supplier tertentu (akses terbatas pada store_id yang cocok).
     */
    public function edit($id)
    {
        $supplier = Supplier::findOrFail($id);
        $cities = City::where('province_id', $supplier->province_id)->get();

        return inertia('Admin/Suppliers/Edit', [
            'supplier' => $supplier,
            'provinces' => Province::all(),
            'cities' => $cities,
        ]);
    }

    /**
     * Perbarui data supplier yang sudah ada di database (hanya jika store_id cocok).
     */
    public function update(SupplierRequest $request, Supplier $supplier)
    {
        $supplier->update($request->validated());

        return redirect()->route('admin.suppliers.index');
    }

    /**
     * Hapus supplier dari database (hanya jika store_id cocok).
     */
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        $supplier->delete();

        return redirect()->route('admin.suppliers.index');
    }
}
