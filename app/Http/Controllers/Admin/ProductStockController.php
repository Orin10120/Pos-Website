<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductStockRequest;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockProduct;
use App\Models\StockTotal;
use App\Models\Supplier;
use App\Models\Store;
use App\Services\UserAccessService;
use Illuminate\Support\Facades\DB;

class ProductStockController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    public function index()
    {
        $storeId = $this->userAccessService->getStoreId();
        $isAdmin = $this->userAccessService->isAdmin();

        $productStocks = StockProduct::with(['product', 'supplier', 'store', 'user'])
            ->when(!$isAdmin, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->when(request()->q, function ($query) {
                $query->whereHas('product', function ($productQuery) {
                    $productQuery->where('name', 'like', '%' . request()->q . '%');
                });
            })
            ->latest()
            ->paginate(10);


        $suppliers = $isAdmin ? Supplier::all() : Supplier::where('store_id', $storeId)->get();
        $stores = $isAdmin ? Store::all() : Store::where('id', $storeId)->get();

        $productStocks->appends(['q' => request()->q]);

        return inertia('Admin/ProductStocks/Index', [
            'productStocks' => $productStocks,
            'suppliers' => $suppliers,
            'stores' => $stores,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function create()
    {
        $storeId = $this->userAccessService->getStoreId();
        $isAdmin = $this->userAccessService->isAdmin();


        $products = Product::with(['stockProducts' => function ($query) use ($storeId) {
            $query->where('store_id', $storeId);
        }, 'stockTotal'])
            ->when(!$isAdmin, function ($query) use ($storeId) {
                $query->where(function ($q) use ($storeId) {
                    $q->whereHas('stockProducts', function ($stockQuery) use ($storeId) {
                        $stockQuery->where('store_id', $storeId);
                    })->orWhereDoesntHave('stockProducts');
                });
            })
            ->get();

        $suppliers = $isAdmin ? Supplier::all() : Supplier::where('store_id', $storeId)->get();
        $stores = $isAdmin ? Store::all() : Store::where('id', $storeId)->get();

        $purchaseOrders = PurchaseOrder::where('status', 'confirmed')
            ->when(!$isAdmin, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->with(['items.product'])
            ->get();

        return inertia('Admin/ProductStocks/Create', [
            'products' => $products,
            'suppliers' => $suppliers,
            'stores' => $stores,
            'warehouses' => $isAdmin ? Store::with('warehouses')->get()->pluck('warehouses')->flatten() : $stores->first()->warehouses,
            'purchaseOrders' => $purchaseOrders,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(ProductStockRequest $request)
    {
        $storeId = $this->userAccessService->getStoreId();
        $isAdmin = $this->userAccessService->isAdmin();

       $validated = $request->validated();

        DB::beginTransaction();
        $userId = $this->userAccessService->getUserId();
        $targetStoreId = $isAdmin ? $validated['store_id'] : $storeId;

        $purchaseOrder = PurchaseOrder::with('items')
            ->where('id', $validated['purchase_order_id'])
            ->where('status', 'confirmed')
            ->when(!$isAdmin, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->firstOrFail();

        foreach ($purchaseOrder->items as $item) {
            $stockProduct = StockProduct::create([
                'product_id' => $item->product_id,
                'supplier_id' => $purchaseOrder->supplier_id,
                'store_id' => $targetStoreId,
                'warehouse_id' => $validated['warehouse_id'],
                'stock_quantity' => $item->quantity,
                'received_at' => $validated['received_at'] ?? now(),
                'purchase_order_id' => $purchaseOrder->id,
                'user_id' => $userId,
            ]);

            $stockTotal = StockTotal::firstOrCreate(
                ['product_id' => $item->product_id],
                ['total_stock' => 0]
            );
            $stockTotal->increment('total_stock', $item->quantity);
        }

        $purchaseOrder->update(['status' => 'received']);

        DB::commit();
        return redirect()->route('admin.stocks.index');
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        $stockProduct = StockProduct::findOrFail($id);

        $stockTotal = StockTotal::where('product_id', $stockProduct->product_id)->first();

        if ($stockTotal) {
            $stockTotal->total_stock -= $stockProduct->stock_quantity;
            $stockTotal->total_stock = max(0, $stockTotal->total_stock);
            $stockTotal->save();
        }

        $stockProduct->delete();

        DB::commit();
        return redirect()->route('admin.stocks.index');
    }
}
