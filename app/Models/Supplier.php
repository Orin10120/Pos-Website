<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = ['name', 'address', 'phone', 'description', 'status', 'province_id', 'city_id', 'store_id'];
}
