<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockOpnameRequest;
use App\Models\StockOpname;
use App\Models\Product;
use App\Models\StockProduct;
use App\Models\StockTotal;
use App\Models\Store;
use App\Models\TransactionDetail;
use App\Services\UserAccessService;
use Carbon\Carbon;

class StockOpnameController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    public function index()
    {
        $storeId = $this->userAccessService->getStoreId();


        if ($this->userAccessService->isAdmin()) {
            $stockOpnames = StockOpname::latest()->paginate(10);
        } else {
            $stockOpnames = StockOpname::where('store_id', $storeId)->latest()->paginate(10);
        }

        $warehouses = Store::where('id', $storeId)
            ->with(['warehouses' => function ($query) {
                $query->get();
            }])
            ->get();

        $storeNames = Store::where('id', $storeId)->get();

        $storeWarehouses = $warehouses->flatMap(function ($store) use ($storeNames) {
            return $store->warehouses->map(function ($warehouse) use ($store, $storeNames) {
                $storeName = $storeNames->firstWhere('id', $store->id);
                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'address' => $warehouse->address,
                    'store_id' => $store->id,
                    'store_name' => $storeName ? $storeName->name : 'Unknown Store'
                ];
            });
        });

        return inertia('Admin/StockOpnames/Index', [
            'stockOpnames' => $stockOpnames,
            'storeWarehouses' => $storeWarehouses,
            'storeNames' => $storeNames
        ]);
    }

    public function create()
    {
        $storeId = $this->userAccessService->getStoreId();

        if ($this->userAccessService->isAdmin()) {
            $products = Product::all();
        } else {
            $products = Product::where('store_id', $storeId)->get();
        }

        return inertia('Admin/StockOpnames/Create', [
            'products' => $products
        ]);
    }

    public function store(StockOpnameRequest $request)
    {
        $validatedData = $request->validated();
        $opnameDate = Carbon::parse($validatedData['opname_date'])->format('Y-m-d');
        $storeId = $this->userAccessService->getStoreId();

        $stockOpname = StockOpname::create([
            'opname_date' => $opnameDate,
            'status' => 'pending',
            'store_id' => $storeId,
        ]);

        foreach ($validatedData['products'] as $productData) {
            $product = Product::find($productData['product_id']);

            if (!$product || ($product->store_id !== $storeId && !$this->userAccessService->isAdmin())) {
                continue;
            }

            $stockTotal = StockTotal::firstOrCreate(
                ['product_id' => $productData['product_id']],
                ['total_stock' => 0]
            );

            $sales = TransactionDetail::where('product_id', $productData['product_id'])
                ->whereHas('transaction', function ($query) {
                    $query->where('status', 'success');
                })
                ->sum('quantity');
            $endingQuantity = $stockTotal->total_stock - $sales;


            $quantityDifference = $productData['physical_quantity'] - $endingQuantity;

            $stockOpname->details()->create([
                'product_id' => $productData['product_id'],
                'stock_total_id' => $stockTotal->id,
                'physical_quantity' => $productData['physical_quantity'],
                'quantity_difference' => $quantityDifference,
            ]);
        }

        return redirect()->route('admin.stock-opnames.index');
    }

    public function edit($id)
    {
        $stockOpname = StockOpname::with(['details.product', 'details.stockTotal'])->findOrFail($id);
        $storeId = $stockOpname->store_id;

        if ($this->userAccessService->isAdmin()) {
            $products = Product::all();
        } else {

            $products = Product::where('store_id', $storeId)->get();
        }

        return inertia('Admin/StockOpnames/Edit', [
            'stockOpname' => $stockOpname,
            'products' => $products
        ]);
    }


    public function update(StockOpnameRequest $request, StockOpname $stockOpname)
    {
        $validatedData = $request->validated();
        $opnameDate = Carbon::parse($validatedData['opname_date'])->format('Y-m-d');
        $storeId = $stockOpname->store_id;

        $stockOpname->update([
            'opname_date' => $opnameDate,
            'status' => $validatedData['status'],
        ]);

        $stockOpname->details()->delete();

        foreach ($validatedData['products'] as $productData) {
            $stockTotal = StockTotal::where('product_id', $productData['product_id'])->first();

            if (!$stockTotal) {
                return redirect()->back()->withErrors([
                    'products' => 'Stok produk dengan ID ' . $productData['product_id'] . ' tidak ditemukan.'
                ]);
            }

            $sales = TransactionDetail::where('product_id', $productData['product_id'])
                ->whereHas('transaction', function ($query) {
                    $query->where('status', 'success');
                })
                ->sum('quantity');
            $endingQuantity = $stockTotal->total_stock - $sales;

            $quantityDifference = $productData['physical_quantity'] - $endingQuantity;

            $stockOpname->details()->create([
                'product_id' => $productData['product_id'],
                'stock_total_id' => $stockTotal->id,
                'physical_quantity' => $productData['physical_quantity'],
                'quantity_difference' => $quantityDifference,
            ]);
        }

        return redirect()->route('admin.stock-opnames.index');
    }

    public function show(StockOpname $stockOpname)
    {
        $storeId = $stockOpname->store_id;
        $storeNames = Store::where('id', $storeId)->get();

        $warehouses = Store::where('id', $storeId)
            ->with('warehouses')
            ->first()
            ->warehouses;

        $storeProducts = StockProduct::select('store_id', 'warehouse_id', 'product_id', 'stock_quantity')
            ->where('store_id', $storeId)
            ->with(['product' => function ($query) {
                $query->select('id', 'purchase_price', 'selling_price', 'barcode', 'name', 'unit_id')
                    ->with('unit');
            }])
            ->get();

        $groupedProducts = $storeProducts->groupBy('product_id');
        $mergedProducts = $groupedProducts->map(function ($group) {
            $totalQuantity = $group->sum('stock_quantity');
            $product = $group->first();
            $product->stock_quantity = $totalQuantity;
            return $product;
        });

        $stockOpname->load('details');

        $stockDetails = $stockOpname->details;

        $salesData = TransactionDetail::selectRaw('product_id, sum(quantity) as total_quantity, sum(subtotal) as total_value')
            ->whereHas('transaction', function ($query) {
                $query->where('status', 'success');
            })
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $mergedProducts->each(function ($product) use ($stockDetails, $salesData) {
            $detail = $stockDetails->where('product_id', $product->product_id)->first();
            $product->physical_quantity = $detail ? $detail->physical_quantity : 0;

            $sales = $salesData->get($product->product_id);
            $product->sales_quantity = $sales ? $sales->total_quantity : 0;

            $product->ending_quantity = $product->stock_quantity - $product->sales_quantity;
            $product->quantity_difference = $product->physical_quantity - $product->ending_quantity;
        });

        $mergedProductsArray = $mergedProducts->values()->toArray();

        $storeStockQuantities = StockProduct::selectRaw('store_id, sum(stock_quantity) as total_stock')
            ->where('store_id', $storeId)
            ->groupBy('store_id')
            ->get();

        return inertia('Admin/StockOpnames/Show', [
            'stockOpname' => $stockOpname,
            'storeNames' => $storeNames,
            'storeProducts' => $mergedProductsArray,
            'warehouses' => $warehouses,
            'storeStockQuantities' => $storeStockQuantities,
            'salesData' => $salesData,
        ]);
    }
}
