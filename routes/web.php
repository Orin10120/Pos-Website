<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserPasskeyController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\Admin\StoreController;
use App\Http\Controllers\Admin\SupplierController;


Route::get('/', function () {
    return \Illuminate\Support\Facades\Auth::check()
        ? redirect()->route('admin.dashboard')
        : redirect()->to('/login');
});


Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'index'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
});

Route::post('/logout', [LogoutController::class, '__invoke'])
    ->middleware('auth')
    ->name('logout');

 Route::prefix('admin')->middleware('auth')->name('admin.')->group(function () {
    Route::get('/dashboard', DashboardController::class)
        ->name('dashboard');

    Route::resource('roles', RoleController::class)->only(['index'])
        ->middleware('permission:roles.index');

    Route::middleware(['role:admin'])->group(function () {
        Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });

    Route::resource('users', UserController::class)->only(['index'])
        ->middleware('permission:users.index');

    Route::middleware(['role:admin'])->group(function () {
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // Face ID / Passkey milik user (didaftarkan oleh admin)
        Route::get('users/{user}/passkeys/options', [UserPasskeyController::class, 'options'])->name('users.passkeys.options');
        Route::post('users/{user}/passkeys', [UserPasskeyController::class, 'store'])->name('users.passkeys.store');
        Route::delete('users/{user}/passkeys/{passkey}', [UserPasskeyController::class, 'destroy'])->name('users.passkeys.destroy');
    });

    Route::resource('stores', StoreController::class)->only(['index'])
    ->middleware('permission:stores.index');

    Route::middleware(['role:admin'])->group(function () {
        Route::get('stores/create', [StoreController::class, 'create'])->name('stores.create');
        Route::post('stores', [StoreController::class, 'store'])->name('stores.store');
        Route::get('stores/{store}/edit', [StoreController::class, 'edit'])->name('stores.edit');
        Route::put('stores/{store}', [StoreController::class, 'update'])->name('stores.update');
        Route::delete('stores/{store}', [StoreController::class, 'destroy'])->name('stores.destroy');
    });

    $resources = [
        'customers' => [
            'controller' => CustomerController::class,
            'permissions' => 'customers.index|customers.create|customers.edit|customers.delete'
        ],
        'suppliers' => [
            'controller' => SupplierController::class,
            'permissions' => 'suppliers.index|suppliers.create|suppliers.edit|suppliers.delete'
        ],
    ];

    foreach ($resources as $name => $resource) {
        Route::resource($name, $resource['controller'])
            ->middleware("permission:{$resource['permissions']}");
    }

    Route::resource('warehouses', WarehouseController::class)->only(['index'])
    ->middleware('permission:stores.index');

    Route::middleware(['role:admin'])->group(function () {
        Route::get('warehouses/create', [WarehouseController::class, 'create'])->name('warehouses.create');
        Route::post('warehouses', [WarehouseController::class, 'store'])->name('warehouses.store');
        Route::get('warehouses/{warehouse}/edit', [WarehouseController::class, 'edit'])->name('warehouses.edit');
        Route::put('warehouses/{warehouse}', [WarehouseController::class, 'update'])->name('warehouses.update');
        Route::delete('warehouses/{warehouse}', [WarehouseController::class, 'destroy'])->name('warehouses.destroy');
    });

    Route::get('/get-cities/{provinceId}', [WarehouseController::class, 'getCitiesByProvince'])->name('get-cities');
});
