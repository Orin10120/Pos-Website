<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;


class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cari role `admin` terlebih dahulu
        $adminRole = Role::where('name', 'admin')->first();

        // Jika role `admin` belum ada, buat role baru
        if (!$adminRole) {
            $adminRole = Role::create(['name' => 'admin']);
        }

        // Ambil semua izin yang ada
        $allPermissions = Permission::all();

        // Assign all permissions to `admin` role
        $adminRole->syncPermissions($allPermissions);

        // Buat user administrator atau ambil user yang sudah ada
        $user = User::firstOrCreate(
            ['email' => 'djuragan@gmail.com'],
            [
                'name' => 'Administrator djuragan',
                'password' => bcrypt('password1234'),
            ]
        );

        // Assign role `admin` ke user
        $user->assignRole($adminRole);
    }
}
