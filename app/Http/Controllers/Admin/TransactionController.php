<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\StockTotal;
use App\Models\Transaction;
use App\Services\UserAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Xendit\Invoice;
use Xendit\Xendit;

class TransactionController extends Controller
{
    /**
     * Menampilkan halaman transaksi dan data terkait.
     */
    public function index(Request $request, UserAccessService $userAccessService)
    {
        $userId = Auth::id();
        $isAdmin = $userAccessService->isAdmin();

        $customers = Customer::all();
        $categories = Category::all();

        if ($userAccessService->isAdmin()) {
            $products = Product::all();
        } else {
            $storeId = Auth::user()->store_id;
            $products = Product::where('store_id', $storeId)->get();
        }

        $carts = Cart::with('product')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'total_price' => $item->total_price,
                    'selling_price' => $item->product->selling_price,
                ];
            });

        $payment_link_url = $request->input('payment_link_url', null);

        return Inertia::render('Admin/Transactions/Index', [
            'customers' => $customers,
            'products' => $products,
            'categories' => $categories,
            'carts' => $carts,
            'payment_link_url' => $payment_link_url,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Menambahkan produk ke keranjang dengan validasi stok.
     */
    public function addProductToCart(Request $request)
    {
        $validatedData = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:1000',
        ]);

        $userId = Auth::id();
        $customerId = $validatedData['customer_id'] ?? null;

        if (! $userId) {
            return redirect()->route('login');
        }

        $productStock = StockTotal::where('product_id', $validatedData['product_id'])->value('total_stock');
        if ($productStock === 0) {
            return redirect()->back()->withErrors(['quantity' => 'Stok produk masih 0.']);
        }

        $cartQuantity = Cart::where('user_id', $userId)
            ->where('product_id', $validatedData['product_id'])
            ->sum('quantity');
        $newQuantity = $cartQuantity + $validatedData['quantity'];

        if ($newQuantity > $productStock) {
            return redirect()->back()->withErrors(['quantity' => 'Kuantitas melebihi stok yang tersedia. Stok saat ini: '.$productStock]);
        }

        $cartItem = Cart::where('user_id', $userId)
            ->where('product_id', $validatedData['product_id'])
            ->first();

        if ($cartItem) {
            if ($customerId && $cartItem->customer_id !== $customerId) {
                $cartItem->customer_id = $customerId;
            }
            $cartItem->quantity += $validatedData['quantity'];
            $cartItem->total_price += $validatedData['total_price'];
            $cartItem->save();
        } else {
            Cart::create([
                'user_id' => $userId,
                'customer_id' => $customerId,
                'product_id' => $validatedData['product_id'],
                'quantity' => $validatedData['quantity'],
                'total_price' => $validatedData['total_price'],
            ]);
        }

        return redirect()->back();
    }

    /**
     * Memproses pembayaran (cash/online) dan menghapus cart jika proses berhasil.
     */
    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'total_amount' => 'required|numeric|min:0',
            'cash' => 'nullable|numeric|min:0',
            'change' => 'nullable|numeric|min:0',
            'cart_items' => 'required|array',
            'cart_items.*.product_id' => 'required|exists:products,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'discount' => 'nullable|numeric',
            'payment_method' => 'required|in:cash,online',
        ]);

        $discount = $validated['discount'] ?? 0;
        $totalAmount = $validated['total_amount'];

        if ($discount > $totalAmount) {
            return redirect()->back()->withErrors([
                'discount' => 'Diskon tidak boleh melebihi total belanja',
            ]);
        }

        $paymentUrl = null;
        $userId = Auth::id();

        DB::transaction(function () use ($validated, &$paymentUrl, $userId) {
            $storeId = Auth::user()->store_id;

            $transaction = Transaction::create([
                'customer_id' => $validated['customer_id'],
                'user_id' => $userId,
                'store_id' => $storeId,
                'total_amount' => $validated['total_amount'],
                'cash' => $validated['payment_method'] === 'cash' ? $validated['cash'] : null,
                'change' => $validated['payment_method'] === 'cash' ? $validated['change'] : null,
                'discount' => $validated['discount'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'status' => $validated['payment_method'] === 'online' ? 'pending' : 'success',
            ]);

            foreach ($validated['cart_items'] as $item) {
                $product = Product::find($item['product_id']);
                $stockTotal = StockTotal::where('product_id', $product->id)->first();

                if (! $stockTotal || $stockTotal->total_stock < $item['quantity']) {
                    return redirect()->back()->withErrors([
                        'quantity' => "Stok produk untuk {$product->name} tidak mencukupi. Stok saat ini: "
                            .($stockTotal->total_stock ?? 0),
                    ]);
                }

                $stockTotal->total_stock -= $item['quantity'];
                $stockTotal->save();

                $transaction->transactionDetails()->create([
                    'product_id' => $item['product_id'],
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['quantity'] * $product->selling_price,
                ]);
            }

            if ($validated['customer_id']) {
                Cart::where('user_id', $userId)
                    ->whereNull('customer_id')
                    ->update(['customer_id' => $validated['customer_id']]);

                Cart::where('customer_id', $validated['customer_id'])
                    ->where('user_id', $userId)
                    ->delete();
            } else {
                Cart::where('user_id', $userId)->delete();
            }

            if ($validated['payment_method'] === 'online') {
                $paymentUrl = $this->createXenditTransaction($transaction);
            }
        });

        if ($validated['payment_method'] === 'online') {
            return redirect()->route('admin.sales.index', ['payment_link_url' => $paymentUrl]);
        }

        return redirect()->route('admin.sales.index');
    }

    /**
     * Membuat Invoice / Link Pembayaran menggunakan Xendit SDK v2.19.
     */
    protected function createXenditTransaction($transaction)
    {
        // Set Secret Key Xendit dari config/services.php atau langsung env
        Xendit::setApiKey(config('services.xendit.secret_key') ?? env('XENDIT_SECRET_KEY'));

        $amountAfterDiscount = $transaction->total_amount - $transaction->discount;
        $finalAmount = max(0, $amountAfterDiscount);

        // Mapping item details untuk Xendit Invoice
        $items = $transaction->transactionDetails->map(function ($detail) {
            return [
                'name' => $detail->product_name,
                'price' => $detail->subtotal / $detail->quantity,
                'quantity' => $detail->quantity,
            ];
        })->toArray();

        // Jika ada diskon, tambahkan sebagai item negatif atau komponen diskon
        if ($transaction->discount > 0) {
            $items[] = [
                'name' => 'Discount',
                'price' => -$transaction->discount,
                'quantity' => 1,
            ];
        }

        $params = [
            'external_id' => (string) $transaction->invoice, // Gunakan nomor invoice Anda sebagai external_id unik
            'amount' => $finalAmount,
            'description' => 'Pembayaran Transaksi #'.$transaction->invoice,
            'invoice_duration' => 86400, // Masa aktif invoice dalam detik (contoh: 24 jam)
            'customer' => [
                'given_names' => $transaction->customer->name ?? 'Guest',
                'email' => $transaction->customer->email ?? 'guest@example.com',
            ],
            'items' => $items,
            'success_redirect_url' => route('admin.sales.index'),
            'failure_redirect_url' => route('admin.sales.index'),
        ];

        // Buat Invoice via Xendit SDK
        $createInvoice = Invoice::create($params);

        // Ambil URL invoice pembayaran dari respons Xendit
        $paymentUrl = $createInvoice['invoice_url'];

        // Simpan payment_link_url ke database jika kolomnya ada
        $transaction->update(['payment_link_url' => $paymentUrl]);

        return $paymentUrl;
    }

    /**
     * Menghapus item dari keranjang berdasarkan ID.
     */
    public function deleteFromCart($id)
    {
        $cartItem = Cart::find($id);
        if ($cartItem) {
            $cartItem->delete();

            return redirect()->back();
        }

        return redirect()->back();
    }
}
