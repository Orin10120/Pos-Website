import { useForm, Head, Link, usePage } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function PurchaseOrderCreate() {
    const { suppliers, stores, poNumber, storeId, isAdmin } = usePage().props

    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: "",
        status: "pending",
        store_id: isAdmin ? "" : storeId,
        po_number: poNumber,
    })

    const createPo = (e) => {
        e.preventDefault()
        post("/admin/po", {
            onSuccess: () => {
                Swal.fire({
                    title: "Success!",
                    text: "Purchase Order created successfully!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                })
                reset()
            },
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setData(name, name === "supplier_id" || name === "store_id" ? Number(value) : value)
    }

    return (
        <>
            <Head>
                <title>Create Purchase Order - EasyPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-plus-square me-2"></i>Buat Purchase Order
                                    </h5>
                                    <Link href="/admin/po" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={createPo}>
                                        <div className="row g-3">

                                            {/* PO Number */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-0"
                                                        id="po_number"
                                                        value={data.po_number}
                                                        disabled
                                                        readOnly
                                                    />
                                                    <label htmlFor="po_number">PO Number</label>
                                                </div>
                                            </div>

                                            {/* Store */}
                                            <div className="col-md-6">
                                                {isAdmin ? (
                                                    <div className="form-floating mb-3">
                                                        <select
                                                            name="store_id"
                                                            id="store_id"
                                                            className={`form-select rounded-0 ${errors.store_id ? "is-invalid" : ""}`}
                                                            value={data.store_id || ""}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="">Pilih Toko...</option>
                                                            {stores.map((store) => (
                                                                <option key={store.id} value={store.id}>
                                                                    {store.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <label htmlFor="store_id">Toko <span className="text-danger">*</span></label>
                                                        {errors.store_id && (
                                                            <div className="invalid-feedback">{errors.store_id}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="form-floating mb-3">
                                                        <input
                                                            type="text"
                                                            className="form-control rounded-0"
                                                            id="store_name"
                                                            value={stores[0]?.name || "N/A"}
                                                            disabled
                                                        />
                                                        <label htmlFor="store_name">Toko</label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Supplier */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        name="supplier_id"
                                                        id="supplier_id"
                                                        className={`form-select rounded-0 ${errors.supplier_id ? "is-invalid" : ""}`}
                                                        value={data.supplier_id || ""}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Pilih Supplier...</option>
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

                                            {/* Status */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        name="status"
                                                        id="status"
                                                        className={`form-select rounded-0 ${errors.status ? "is-invalid" : ""}`}
                                                        value={data.status}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="received">Received</option>
                                                    </select>
                                                    <label htmlFor="status">Status</label>
                                                    {errors.status && (
                                                        <div className="invalid-feedback">{errors.status}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="col-12 d-flex justify-content-between border-top mt-4 pt-4">
                                                <Link href="/admin/po" className="btn btn-outline-secondary">
                                                    <i className="bi bi-x-lg me-2"></i>Batal
                                                </Link>
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
