<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $fillable = ['name', 'address', 'province_id', 'city_id'];

    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function stockProducts()
    {
        return $this->hasMany(StockProduct::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function products()
    {
        return $this->hasManyThrough(Product::class, StockProduct::class, 'store_id', 'id', 'id', 'product_id');
    }
}
