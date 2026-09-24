<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{

    public function index()
    {
        $user = auth()->user();
        $hiddenForNonAdmin = ['admin'];

        $roles = Role::with('permissions')
            ->when(!$user->hasRole('admin'), function ($query) use ($hiddenForNonAdmin) {
                $query->whereNotIn('name', $hiddenForNonAdmin);
            })
            ->latest()
            ->paginate(10);

        return inertia('Admin/Roles/Index', [
            'roles' => $roles,
            'isAdmin' => $user->hasRole('admin'),
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();
        return inertia('Admin/Roles/Create', ['permissions' => $permissions]);
    }

    public function store(RoleRequest $request)
    {
        $validatedData = $request->validated();

        if (Role::where('name', $validatedData['name'])->exists()) {
            return redirect()->back()->withErrors(['name' => 'A role `admin` already exists.'])->withInput();
        }

        $role = Role::create($validatedData);
        $role->syncPermissions($request->input('permissions'));

        return redirect()->route('admin.roles.index');
    }


    public function edit(Role $role)
    {
        $permissions = Permission::latest()->get()->map(function ($permission) {
            return ['id' => $permission->id, 'name' => $permission->name];
        });

        $rolePermissions = $role->permissions->pluck('id')->toArray();

        return inertia('Admin/Roles/Edit', [
            'permissions' => $permissions,
            'role' => $role,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    public function update(RoleRequest $request, Role $role)
    {
        $role->name = $request->name;
        $role->permissions()->sync($request->permissions);
        $role->save();

        return redirect()->route('admin.roles.index');
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return redirect()->route('admin.roles.index');
    }
}
