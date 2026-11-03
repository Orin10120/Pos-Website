<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Services\UserAccessService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    public function index()
    {
        $user = auth()->user();

        if ($this->userAccessService->isAdmin()) {
            $users = User::all();
        } else {
            $users = User::where('store_id', $this->userAccessService->getStoreId())->get();
        }

        return Inertia::render('Admin/Report/Index', [
            'transactions' => [],
            'users' => $users,
            'user_id' => null,
        ]);
    }


    public function generate(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $startDateTime = $request->start_date . ' 00:00:00';
        $endDateTime = $request->end_date . ' 23:59:59';

        $user = auth()->user();

        if ($user->hasRole('admin')) {
            $transactions = Transaction::with(['customer', 'transactionDetails'])
                ->withSum('transactionDetails as total_quantity', 'quantity')
                ->whereBetween('transaction_date', [$startDateTime, $endDateTime])
                ->when($request->user_id, fn($query) => $query->where('user_id', $request->user_id))
                ->orderBy('transaction_date', 'desc')
                ->get();
        } else {
            $storeId = $this->userAccessService->getStoreId();
            $transactions = Transaction::with(['customer', 'transactionDetails'])
                ->withSum('transactionDetails as total_quantity', 'quantity')
                ->whereBetween('transaction_date', [$startDateTime, $endDateTime])
                ->where('store_id', $storeId)
                ->when($request->user_id, fn($query) => $query->where('user_id', $request->user_id))
                ->orderBy('transaction_date', 'desc')
                ->get();
        }

        $totalAmount = $transactions->sum('total_amount');

        // Kolom total_amount bertipe string di database, sehingga SUM() dari PostgreSQL
        // gagal (error 500). Karena itu total per status dihitung dari koleksi yang
        // sudah dimuat — sekaligus dijamin konsisten dengan isi tabel transaksi.
        $totalByStatus = $transactions
            ->groupBy('status')
            ->map(fn ($items) => $items->sum(fn ($transaction) => (float) $transaction->total_amount))
            ->all();

        $totalSuccess = $totalByStatus['success'] ?? 0;
        $totalPending = $totalByStatus['pending'] ?? 0;

        $users = $user->hasRole('admin') ? User::all() : User::where('store_id', $user->store_id)->get();

        return Inertia::render('Admin/Report/Index', [
            'transactions' => $transactions,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'users' => $users,
            'selectedUserId' => $request->user_id ?? "",
            'totalAmount' => $totalAmount,
            'totalSuccess' => $totalSuccess,
            'totalPending' => $totalPending,
        ]);
    }
}
