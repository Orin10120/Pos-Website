<?php

namespace App\Services;

use App\Models\StockOpname;
use App\Models\StockProduct;
use App\Models\Store;
use App\Models\TransactionDetail;
use App\Models\Warehouse;
use Illuminate\Support\Collection;

/**
 * Menyiapkan data laporan stock opname: informasi toko, daftar gudang,
 * daftar produk beserta stok, penjualan, dan selisihnya.
 *
 * Dipakai oleh halaman detail (Show) dan export Excel agar keduanya
 * selalu menampilkan angka yang sama.
 */
final class StockOpnameReportBuilder
{
    /**
     * @return array{
     *     storeNames: Collection<int, Store>,
     *     warehouses: Collection<int, Warehouse>,
     *     products: Collection<int, StockProduct>,
     *     storeStockQuantities: Collection<int, StockProduct>,
     *     salesData: Collection<int, TransactionDetail>
     * }
     */
    public function build(StockOpname $stockOpname): array
    {
        $storeId = $stockOpname->store_id;

        $storeNames = Store::where('id', $storeId)->get();

        $warehouses = Store::where('id', $storeId)
            ->with('warehouses')
            ->first()?->warehouses
            ?? collect();

        $storeProducts = StockProduct::select('store_id', 'warehouse_id', 'product_id', 'stock_quantity')
            ->where('store_id', $storeId)
            ->with(['product' => function ($query) {
                $query->select('id', 'purchase_price', 'selling_price', 'barcode', 'name', 'unit_id')
                    ->with('unit');
            }])
            ->get();

        $mergedProducts = $storeProducts->groupBy('product_id')->map(function ($group) {
            $product = $group->first();
            $product->stock_quantity = $group->sum('stock_quantity');

            return $product;
        });

        $stockOpname->loadMissing('details');
        $stockDetails = $stockOpname->details;

        $salesData = TransactionDetail::selectRaw('product_id, sum(quantity) as total_quantity, sum(subtotal) as total_value')
            ->whereHas('transaction', function ($query) {
                $query->where('status', 'success');
            })
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $mergedProducts->each(function ($product) use ($stockDetails, $salesData) {
            $detail = $stockDetails->firstWhere('product_id', $product->product_id);
            $product->physical_quantity = $detail ? $detail->physical_quantity : 0;

            $sales = $salesData->get($product->product_id);
            $product->sales_quantity = $sales ? $sales->total_quantity : 0;

            $product->ending_quantity = $product->stock_quantity - $product->sales_quantity;
            $product->quantity_difference = $product->physical_quantity - $product->ending_quantity;
        });

        $storeStockQuantities = StockProduct::selectRaw('store_id, sum(stock_quantity) as total_stock')
            ->where('store_id', $storeId)
            ->groupBy('store_id')
            ->get();

        return [
            'storeNames' => $storeNames,
            'warehouses' => $warehouses,
            'products' => $mergedProducts->values(),
            'storeStockQuantities' => $storeStockQuantities,
            'salesData' => $salesData,
        ];
    }
}
