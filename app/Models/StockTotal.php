<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTotal extends Model
{
    protected $fillable = ['product_id', 'total_stock'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
