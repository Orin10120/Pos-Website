<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use App\Models\Customer;

class CustomerController extends Controller
{
    /**
     * Tampilkan daftar customer.
     */
    public function index()
    {

        $customers = Customer::when(request()->q, function ($query) {
            $query->where('name', 'like', '%' . request()->q . '%');
        })->latest()->paginate(10);

        $customers->appends(['q' => request()->q]);

        return inertia('Admin/Customers/Index', [
            'customers' => $customers
        ]);
    }

    /**
     * Tampilkan form untuk membuat customer baru.
     */
    public function create()
    {

        return inertia('Admin/Customers/Create');
    }

    /**
     * Simpan customer baru ke dalam database.
     */
    public function store(CustomerRequest $request)
    {

        Customer::create($request->validated());

        return redirect()->route('admin.customers.index');
    }

    /**
     * Tampilkan form untuk mengedit customer tertentu.
     */
    public function edit($id)
    {

        $customer = Customer::findOrFail($id);

        return inertia('Admin/Customers/Edit', [
            'customer' => $customer
        ]);
    }

    /**
     * Perbarui data customer yang sudah ada di database.
     */
    public function update(CustomerRequest $request, Customer $customer)
    {

        $customer->update($request->validated());

        return redirect()->route('admin.customers.index');
    }

    /**
     * Hapus customer dari database.
     */
    public function destroy($id)
    {

        $customer = Customer::findOrFail($id);
        $customer->delete();

        return redirect()->route('admin.customers.index');
    }
}
