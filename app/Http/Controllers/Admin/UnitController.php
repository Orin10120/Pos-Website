<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnitRequest;
use App\Models\Unit;

class UnitController extends Controller
{
    /**
     * Tampilkan daftar semua unit.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $units = Unit::when(request()->q, function ($query) {
            return $query->where('name', 'like', '%' . request()->q . '%');
        })->latest()->paginate(10);
        $units->appends(['q' => request()->q]);

        return inertia('Admin/Units/Index', [
            'units' => $units
        ]);
    }

    /**
     * Tampilkan form untuk membuat unit baru.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return inertia('Admin/Units/Create');
    }

    /**
     * Simpan unit baru ke dalam database.
     *
     * @param  \App\Http\Requests\UnitRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(UnitRequest $request)
    {
        Unit::create($request->validated());

        return redirect()->route('admin.units.index');
    }

    /**
     * Tampilkan form untuk mengedit unit tertentu.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $unit = Unit::findOrFail($id);
        return inertia('Admin/Units/Edit', [
            'unit' => $unit
        ]);
    }

    /**
     * Perbarui unit yang sudah ada di database.
     *
     * @param  \App\Http\Requests\UnitRequest  $request
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function update(UnitRequest $request, Unit $unit)
    {
        $unit->update($request->validated());

        return redirect()->route('admin.units.index');
    }

    /**
     * Hapus unit dari database.
     *
     * @param  \App\Models\Unit  $unit
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $unit = Unit::findOrFail($id);
        $unit->delete();

        return redirect()->route('admin.units.index');
    }
}
