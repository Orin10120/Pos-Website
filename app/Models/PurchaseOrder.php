<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = ['po_number', 'store_id', 'supplier_id', 'user_id', 'status', 'total_price'];
}
