<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;
use App\Services\UserAccessService;

class PurchaseOrderItemController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    public function index(PurchaseOrder $po)
    {
        $items = $po->items()->with('product', 'unit')->get();
        return inertia('Admin/PoItems/Index', [
            'po' => $po,
            'items' => $items,
        ]);
    }

    public function create(PurchaseOrder $po)
    {
        $storeId = $this->userAccessService->getStoreId();
        $isAdmin = $this->userAccessService->isAdmin();

        $products = $isAdmin
            ? Product::all()
            : Product::where('store_id', $storeId)->get();

        $units = Unit::all();

        return inertia('Admin/PoItems/Create', [
            'po' => $po,
            'products' => $products,
            'units' => $units,
        ]);
    }

    public function store(Request $request, PurchaseOrder $po)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $product = Product::findOrFail($validatedData['product_id']);
        $validatedData['unit_id'] = $product->unit_id;
        $po->items()->create($validatedData);
        $totalPrice = $po->items()->sum(DB::raw('quantity * unit_price'));
        $po->update(['total_price' => $totalPrice]);

        return redirect()->route('admin.po.items.index', $po->id);
    }
}
