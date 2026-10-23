import { Head, Link, useForm, usePage } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function ProductStockCreate() {
    const { isAdmin, suppliers, warehouses, purchaseOrders, stores } = usePage().props

    const { data, setData, post, processing, reset, errors } = useForm({
        purchase_order_id: "",
        warehouse_id: "",
        supplier_id: "",
        received_at: "",
        store_id: "",
    })

    const handlePurchaseOrderChange = (poId) => {
        const po = purchaseOrders.find((order) => order.id == poId)
        if (po) {
            setData({
                ...data,
                purchase_order_id: poId,
                supplier_id: po.supplier_id,
            })
        } else {
            setData({
                ...data,
                purchase_order_id: "",
                supplier_id: "",
            })
        }
    }

    const createStock = async (e) => {
        e.preventDefault()

        post("/admin/stocks", {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Stok produk berhasil ditambahkan",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                })
                reset()
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(', ')
                Swal.fire({
                    title: "Gagal!",
                    text: errorMessage || "Terjadi kesalahan saat menambahkan stok",
                    icon: "error",
                    confirmButtonText: "OK",
                })
            },
        })
    }

    return (
        <>
            <Head>
                <title>Tambah Stok - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-box-seam me-2"></i>
                                        Tambah Stok Produk
                                    </h5>
                                    <Link
                                        href="/admin/stocks"
                                        className="btn btn-outline-secondary btn-sm"
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={createStock}>
                                        <div className="row g-3">

                                            {/* Purchase Order */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        className={`form-select rounded-0 ${errors.purchase_order_id ? "is-invalid" : ""}`}
                                                        id="purchase_order_id"
                                                        value={data.purchase_order_id}
                                                        onChange={(e) => handlePurchaseOrderChange(Number(e.target.value))}
                                                    >
                                                        <option value="">Pilih Purchase Order...</option>
                                                        {purchaseOrders.map((po) => (
                                                            <option key={po.id} value={po.id}>
                                                                {po.po_number} - {po.status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label htmlFor="purchase_order_id">Purchase Order <span className="text-danger">*</span></label>
                                                    {errors.purchase_order_id && (
                                                        <div className="invalid-feedback">{errors.purchase_order_id}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Supplier */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        className={`form-select rounded-0 ${errors.supplier_id ? "is-invalid" : ""}`}
                                                        id="supplier_id"
                                                        value={data.supplier_id}
                                                        disabled={true}
                                                    >
                                                        <option value="">Pilih Purchase Order terlebih dahulu...</option>
                                                        {suppliers.map((supplier) => (
                                                            <option key={supplier.id} value={supplier.id}>
                                                                {supplier.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label htmlFor="supplier_id">Supplier <span className="text-danger">*</span></label>
                                                    {errors.supplier_id && (
                                                        <div className="invalid-feedback">{errors.supplier_id}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Gudang */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        className={`form-select rounded-0 ${errors.warehouse_id ? "is-invalid" : ""}`}
                                                        id="warehouse_id"
                                                        value={data.warehouse_id}
                                                        onChange={(e) => setData("warehouse_id", Number(e.target.value))}
                                                    >
                                                        <option value="">Pilih Gudang...</option>
                                                        {warehouses.map((warehouse) => (
                                                            <option key={warehouse.id} value={warehouse.id}>
                                                                {warehouse.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label htmlFor="warehouse_id">Gudang <span className="text-danger">*</span></label>
                                                    {errors.warehouse_id && (
                                                        <div className="invalid-feedback">{errors.warehouse_id}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tanggal Diterima */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="date"
                                                        className={`form-control rounded-0 ${errors.received_at ? "is-invalid" : ""}`}
                                                        id="received_at"
                                                        placeholder="Tanggal Diterima"
                                                        value={data.received_at}
                                                        onChange={(e) => setData("received_at", e.target.value)}
                                                    />
                                                    <label htmlFor="received_at">Tanggal Diterima</label>
                                                    {errors.received_at && (
                                                        <div className="invalid-feedback">{errors.received_at}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Store - Only For Admin */}
                                            {isAdmin && (
                                                <div className="col-md-12">
                                                    <div className="form-floating mb-3">
                                                        <select
                                                            className={`form-select rounded-0 ${errors.store_id ? "is-invalid" : ""}`}
                                                            id="store_id"
                                                            value={data.store_id}
                                                            onChange={(e) => setData("store_id", Number(e.target.value))}
                                                        >
                                                            <option value="">Pilih Store...</option>
                                                            {stores.map((store) => (
                                                                <option key={store.id} value={store.id}>
                                                                    {store.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <label htmlFor="store_id">Store <span className="text-danger">*</span></label>
                                                        {errors.store_id && (
                                                            <div className="invalid-feedback">{errors.store_id}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="col-12 d-flex justify-content-between border-top mt-4 pt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => reset()}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise me-2"></i>Reset
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-save me-2"></i>Simpan
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}
