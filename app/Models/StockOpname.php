<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    protected $fillable = ['store_id', 'opname_date', 'status'];

    /**
     * Relasi ke model StockOpnameDetail.
     * Satu stock opname memiliki banyak detail stock opname.
     */
    public function details()
    {
        return $this->hasMany(StockOpnameDetail::class);
    }
}
