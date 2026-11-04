<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Services\UserAccessService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfitController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    public function index()
    {
        $users = User::where('store_id', $this->userAccessService->getStoreId())->get();
        return Inertia::render('Admin/Profit/Index', [
            'transactions' => [],
            'users' => $users,
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

        $storeId = $this->userAccessService->getStoreId();

        $query = Transaction::with(['transactionDetails.product'])
            ->whereBetween('transaction_date', [$startDateTime, $endDateTime])
            ->where('status', 'success');

        if (!$this->userAccessService->isAdmin()) {
            $query->where('store_id', $storeId);
        }

        if ($request->has('user_id') && $request->user_id !== null) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        $transactions = $transactions->map(function ($transaction) {
            $profit = $transaction->transactionDetails->reduce(function ($carry, $detail) {
                $sellingPrice = $detail->product->selling_price ?? 0;
                $purchasePrice = $detail->product->purchase_price ?? 0;
                $profitPerItem = max(0, ($sellingPrice - $purchasePrice)) * ($detail->quantity ?? 0);
                return $carry + $profitPerItem;
            }, 0);

            $transaction->profit = $profit;
            return $transaction;
        });

        $totalProfit = $transactions->sum('profit');

        $totalProfitOnline = $transactions->filter(function ($transaction) {
            return strtolower($transaction->payment_method) === 'online';
        })->sum('profit');

        $totalProfitCash = $transactions->filter(function ($transaction) {
            return strtolower($transaction->payment_method) === 'cash';
        })->sum('profit');

        $users = User::where('store_id', $storeId)->get();

        return Inertia::render('Admin/Profit/Index', [
            'transactions' => $transactions,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'users' => $users,
            'selectedUserId' => $request->user_id ?? "",
            'totalProfit' => $totalProfit,
            'totalProfitOnline' => $totalProfitOnline,
            'totalProfitCash' => $totalProfitCash,
            'errors' => [],
        ]);
    }
}
