<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\Store;
use App\Services\UserAccessService;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PoController extends Controller
{
    protected $userAccessService;

    public function __construct(UserAccessService $userAccessService)
    {
        $this->userAccessService = $userAccessService;
    }

    /**
     * Display a listing of purchase orders.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $storeId = $this->userAccessService->getStoreId();

        $purchaseOrders = PurchaseOrder::with(['store', 'supplier', 'user', 'items.product', 'items.unit'])
            ->when($storeId && !$this->userAccessService->isAdmin(), function ($query) use ($storeId) {
                $query->where('store_id', $storeId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Po/Index', [
            'purchaseOrders' => $purchaseOrders
        ]);
    }

    /**
     * Show the form for creating a new purchase order.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $user = auth()->user();
        $storeId = $this->userAccessService->getStoreId();

        if ($this->userAccessService->isAdmin()) {
            $suppliers = Supplier::all();
        } else {
            $suppliers = Supplier::where('store_id', $user->store_id)->get();
        }

        if ($this->userAccessService->isAdmin()) {
            $stores = Store::all();
        } else {
            $stores = Store::where('id', $user->store_id)->get();
        }

        $poNumber = 'PO-' . strtoupper(Str::random(8));

        return Inertia::render('Admin/Po/Create', [
            'suppliers' => $suppliers,
            'stores' => $stores,
            'poNumber' => $poNumber,
            'storeId' => $storeId,
            'isAdmin' => $this->userAccessService->isAdmin(),
        ]);
    }

    /**
     * Store a newly created purchase order in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'status' => 'required|in:pending,confirmed,received',
            'store_id' => 'required|exists:stores,id',
        ]);

        $validatedData['user_id'] = auth()->id();
        $validatedData['po_number'] = $request->po_number;

        // Menghapus deklarasi variabel $purchaseOrder
        PurchaseOrder::create($validatedData);

        return redirect()->route('admin.po.index');
    }


    /**
     * Update the status of a purchase order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        $validatedData = $request->validate([
            'status' => 'required|in:pending,confirmed,received',
        ]);

        $purchaseOrder->update($validatedData);

        return redirect()->route('admin.po.index');
    }

    /**
     * Remove the specified purchase order from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        PurchaseOrderItem::where('purchase_order_id', $purchaseOrder->id)->delete();

        $purchaseOrder->delete();

        return redirect()->route('admin.po.index');
    }
}
