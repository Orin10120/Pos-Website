<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpnameDetail extends Model
{
    protected $fillable = ['stock_opname_id', 'product_id', 'stock_total_id', 'physical_quantity', 'quantity_difference'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stockTotal()
    {
        return $this->belongsTo(StockTotal::class, 'product_id', 'product_id');
    }

    public function stockProduct()
    {
        return $this->belongsTo(StockProduct::class, 'stock_product_id');
    }
}
