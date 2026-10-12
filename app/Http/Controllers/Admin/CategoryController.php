<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Tampilkan daftar kategori.
     */
    public function index()
    {
        $categories = Category::when(request()->search, function ($query) {
            $query->where('name', 'like', '%' . request()->search . '%');
        })->latest()->paginate(10);

        $categories->appends(['search' => request()->search]);


        return inertia('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Tampilkan form untuk membuat kategori baru.
     */
    public function create()
    {
        return Inertia('Admin/Categories/Create');
    }

    /**
     * Simpan kategori baru ke dalam database.
     */
    public function store(CategoryRequest $request)
    {

        Category::create($request->validated());


        return redirect()->route('admin.categories.index');
    }

    /**
     * Tampilkan form untuk mengedit kategori tertentu.
     */
    public function edit($id)
    {

        $category = Category::findOrFail($id);

        return inertia('Admin/Categories/Edit', [
            'category' => $category
        ]);
    }

    /**
     * Perbarui kategori yang sudah ada di database.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return redirect()->route('admin.categories.index');
    }

    /**
     * Hapus kategori tertentu dari database.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->route('admin.categories.index');
    }
}
