<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
        {
            $resources = [
                'dashboard' => ['view_sales', 'view_transactions', 'view_products', 'view_supplier', 'view_customers'],
                'roles' => ['index'],
                'users' => ['index'],
                'warehouses' => ['index'],
                'stores' => ['index'],
                'profiles' => ['index'],
                'suppliers' => ['index', 'create', 'edit', 'delete'],
                'customers' => ['index', 'create', 'edit', 'delete'],
                'categories' => ['index', 'create', 'edit', 'delete'],
                'units' => ['index', 'create', 'edit', 'delete'],
                'products' => ['index', 'create', 'edit', 'delete'],
                'purchaseorders' => ['index', 'edit', 'create', 'delete'],
                'purchaseorderitems' => ['index', 'create'],
                'stocks' => ['index', 'create', 'delete'],
                'transactions' => ['index'],
                'reports' => ['index'],
                'profits' => ['index'],
                'stock-opnames' => ['index', 'create', 'edit', 'show'],
            ];

            foreach ($resources as $resource => $actions) {
                foreach ($actions as $action) {
                    $permissionName = "{$resource}.{$action}";

                    Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
                }
            }
        }
}
