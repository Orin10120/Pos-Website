<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\Store;
use App\Services\UserAccessService;

class UserController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    public function index()
    {
        $isAdmin = $this->userAccessService->isAdmin();
        $storeId = $this->userAccessService->getStoreId();
        $searchTerm = request()->q;

        $query = User::query()
            ->with(['roles', 'store'])
            ->when($searchTerm, function ($query) use ($searchTerm) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%");
                });
            });

        if (!$isAdmin) {
            $query->where('store_id', $storeId);
        }

        $users = $query->latest()
            ->paginate(5)
            ->withQueryString();

        return inertia('Admin/Users/Index', [
            'users' => $users,
            'isAdmin' => $isAdmin,
            'filters' => ['q' => $searchTerm]
        ]);
    }

    public function create()
    {
        $roles = Role::where('name', '!=', 'admin')->get();
        $stores = Store::all();

        return inertia('Admin/Users/Create', [
            'roles' => $roles,
            'stores' => $stores,
            'defaults' => [
                'store_id' => null,
            ]
        ]);
    }

    public function store(UserRequest $request)
    {
        try {
            $data = $request->validated();

            // Face embeddings/descriptor sudah dikirim dari Client (React + Face API)
            // berupa Array Float32 / JSON String
            if ($request->has('face_embeddings') && !empty($request->face_embeddings)) {
                $data['face_embeddings'] = is_array($request->face_embeddings)
                    ? json_encode($request->face_embeddings)
                    : $request->face_embeddings;
            } else {
                $data['face_embeddings'] = null;
            }

            $data['password'] = bcrypt($data['password']);

            $user = User::create($data);
            $user->assignRole($request->roles);

            return redirect()->route('admin.users.index')
                ->with('success', 'User created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to create user: ' . $e->getMessage()]);
        }
    }

    public function edit(User $user)
    {
        $user->load(['roles', 'store']);
        $roles = Role::where('name', '!=', 'admin')->get();
        $stores = Store::all();

        return inertia('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'stores' => $stores
        ]);
    }

    public function update(UserRequest $request, User $user)
    {
        $data = $request->validated();

        if ($request->filled('password')) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        // Update face embeddings jika ada pembaruan dari frontend
        if ($request->has('face_embeddings') && !empty($request->face_embeddings)) {
            $data['face_embeddings'] = is_array($request->face_embeddings)
                ? json_encode($request->face_embeddings)
                : $request->face_embeddings;
        }

        $user->update($data);
        $user->syncRoles($request->roles);

        return redirect()->route('admin.users.index');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()
                ->with('error', 'You cannot delete your own account');
        }
        $user->delete();

        return redirect()->route('admin.users.index');
    }
}
