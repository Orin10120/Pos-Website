<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\StockTotal;
use App\Models\Supplier;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Services\UserAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    public function __invoke(Request $request)
    {
        $isAdmin = $this->userAccessService->isAdmin();
        $storeId = $this->userAccessService->getStoreId();
        $userId = $this->userAccessService->getUserId();

        // Statistik utama dengan filter
        $totalSales = Transaction::where('status', 'success')
            ->when(!$isAdmin && $storeId, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->sum(DB::raw('CAST(total_amount AS NUMERIC)'));

        $totalTransactions = Transaction::query()
            ->when(!$isAdmin && $storeId, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->count();

        // Customer tidak memiliki store_id, jadi tampilkan semua tanpa filter
        $totalCustomers = Customer::count();

        $totalSuppliers = Supplier::where('status', 'active')
            ->when(!$isAdmin && $storeId, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->count();

        // Total transaksi per status dengan filter
        $transactionData = Transaction::query()
            ->when(!$isAdmin && $storeId, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Penjualan per tanggal (status success) dengan filter
        $salesData = Transaction::whereIn('status', ['success'])
            ->when(!$isAdmin && $storeId, function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->select(
                DB::raw('DATE(transaction_date) as date'),
                DB::raw('SUM(CAST(total_amount AS NUMERIC)) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 5 produk terlaris dengan filter berdasarkan transaksi di store user
        $productsData = TransactionDetail::with('product')
            ->whereHas('transaction', function ($query) use ($isAdmin, $storeId) {
                if (!$isAdmin && $storeId) {
                    $query->where('store_id', $storeId);
                }
            })
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(function ($detail) {
                return [
                    'name'           => $detail->product->name ?? 'Unknown',
                    'total_quantity' => $detail->total_quantity,
                ];
            });

        // Total stok per kategori dengan filter berdasarkan store_id di products
        $stockTotals = StockTotal::with(['product' => function ($query) use ($isAdmin, $storeId) {
            if (!$isAdmin && $storeId) {
                $query->where('store_id', $storeId);
            }
        }, 'product.category'])
            ->whereHas('product', function ($query) use ($isAdmin, $storeId) {
                if (!$isAdmin && $storeId) {
                    $query->where('store_id', $storeId);
                }
            })
            ->get();

        $groupedByCategory = $stockTotals->groupBy(function ($item) {
            return optional($item->product->category)->name ?? 'Uncategorized';
        });

        $categoryData = $groupedByCategory->map(function ($items, $categoryName) {
            return [
                'category'    => $categoryName,
                'total_stock' => $items->sum('total_stock'),
            ];
        })->values();

        // Kirim data ke Inertia
        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => [
                'totalSales'        => $totalSales,
                'totalTransactions' => $totalTransactions,
                'totalCustomers'    => $totalCustomers,
                'totalSuppliers'    => $totalSuppliers,
            ],
            'transactionData' => $transactionData,
            'salesData'       => $salesData,
            'productsData'    => $productsData,
            'categoryData'    => $categoryData,
            'userInfo' => [
                'is_admin' => $isAdmin,
                'store_id' => $storeId,
                'user_id'  => $userId,
            ],
        ]);
    }
}
