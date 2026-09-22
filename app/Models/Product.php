<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    protected $fillable = ['user_id', 'store_id', 'image', 'barcode', 'name', 'category_id', 'unit_id', 'selling_price', 'purchase_price'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function stockTotal()
    {
        return $this->hasOne(StockTotal::class);
    }

    public function stockProducts()
    {
        return $this->hasMany(StockProduct::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn($image) => url('/storage/products/' . $image),
        );
    }
}
