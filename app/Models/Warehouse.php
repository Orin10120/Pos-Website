<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = ['name', 'address', 'province_id', 'city_id'];

    public function stores()
    {
        return $this->belongsToMany(Store::class, 'store_warehouse');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function stockProducts()
    {
        return $this->hasMany(StockProduct::class);
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }
}
