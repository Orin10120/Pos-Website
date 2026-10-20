<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Models\Category;
use App\Models\Unit;
use App\Services\UserAccessService;
use App\Traits\ImageHandlerTrait;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use ImageHandlerTrait;

    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    /**
     * Tampilkan daftar produk.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $isAdmin = $this->userAccessService->isAdmin();
        $storeId = $this->userAccessService->getStoreId();

        $products = Product::with(['category', 'stockProducts', 'stockTotal'])
            ->when(request()->q, function ($query) {
                $query->where('name', 'like', '%' . request()->q . '%');
            })
            ->when(!$isAdmin, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->latest()
            ->paginate(10);

        $products->appends(['q' => request()->q]);

        return inertia('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    /**
     * Tampilkan form untuk membuat produk baru.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $categories = Category::all();
        $units = Unit::all();

        return inertia('Admin/Products/Create', [
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    /**
     * Simpan produk baru ke dalam database.
     *
     * @param  \App\Http\Requests\ProductRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(ProductRequest $request)
    {
        $storeId = $this->userAccessService->getStoreId();

        if ($request->purchase_price > $request->selling_price) {
            return redirect()->back()->withErrors([
                'purchase_price' => 'Harga pembelian tidak boleh lebih besar dari harga penjualan.'
            ]);
        }

        $imageName = null;
        if ($request->hasFile('image')) {
            $imageName = $this->uploadImage($request->file('image'), 'products');
        }

        Product::create(array_merge(
            $request->validated(),
            [
                'image' => $imageName,
                'user_id' => $this->userAccessService->getUserId(),
                'store_id' => $storeId,
            ]
        ));

        return redirect()->route('admin.products.index');
    }

    /**
     * Tampilkan form untuk mengedit produk.
     *
     * @param  \App\Models\Product  $product
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        $product = Product::findOrFail($id);
        $categories = Category::all();
        $units = Unit::all();

        return inertia('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    /**
     * Perbarui data produk dalam database.
     *
     * @param  \App\Http\Requests\ProductRequest  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(ProductRequest $request, Product $product)
    {
        if ($request->purchase_price > $request->selling_price) {
            return redirect()->back()->withErrors([
                'purchase_price' => 'Harga pembelian tidak boleh lebih besar dari harga penjualan.'
            ]);
        }


        if ($request->hasFile('image')) {
            $product->image = $this->updateImage($product->image, $request->file('image'), 'products');
        }

        $product->update([
            'name' => $request->validated()['name'],
            'barcode' => $request->validated()['barcode'],
            'category_id' => $request->validated()['category_id'],
            'unit_id' => $request->validated()['unit_id'],
            'purchase_price' => $request->validated()['purchase_price'],
            'selling_price' => $request->validated()['selling_price'],
        ]);

        return redirect()->route('admin.products.index');
    }

    /**
     * Hapus produk dari database.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete('products/' . $product->image);
        }
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus!');
    }
}
