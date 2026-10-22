import { useForm, Head, Link, usePage } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function PurchaseOrderItemCreate() {
    const { po, products, units } = usePage().props

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: "",
        unit_id: "",
        quantity: "",
        unit_price: "",
    })

    const createItem = async (e) => {
        e.preventDefault()

        post(`/admin/po/${po.id}/items`, {
            onSuccess: () => {
                Swal.fire({
                    title: "Success!",
                    text: "Item added successfully!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                })
                reset()
            },
        })
    }

    const handleProductChange = (e) => {
        const selectedProductId = e.target.value
        setData("product_id", selectedProductId)
        const selectedProduct = products.find(
            (product) => product.id.toString() === selectedProductId
        )
        if (selectedProduct) {
            setData("unit_id", selectedProduct.unit_id)
            setData("unit_price", selectedProduct.purchase_price)
        } else {
            setData("unit_id", "")
            setData("unit_price", "")
        }
    }

    return (
        <>
            <Head title={`Tambah Item ke PO ${po.po_number}`} />
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-cart-plus me-2"></i>
                                        Tambah Item - {po.po_number}
                                    </h5>
                                    <Link
                                        href={`/admin/po/${po.id}/items`}
                                        className="btn btn-outline-secondary btn-sm"
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={createItem}>
                                        <div className="row g-3">

                                            {/* Product */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        className={`form-select rounded-0 ${errors.product_id ? "is-invalid" : ""}`}
                                                        id="product_id"
                                                        value={data.product_id}
                                                        onChange={handleProductChange}
                                                        required
                                                    >
                                                        <option value="">Pilih Produk...</option>
                                                        {products.map((product) => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label htmlFor="product_id">Produk</label>
                                                    {errors.product_id && <div className="invalid-feedback">{errors.product_id}</div>}
                                                </div>
                                            </div>

                                            {/* Unit */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        className={`form-select rounded-0 ${errors.unit_id ? "is-invalid" : ""}`}
                                                        id="unit_id"
                                                        value={data.unit_id}
                                                        onChange={(e) => setData("unit_id", e.target.value)}
                                                        disabled
                                                    >
                                                        <option value="">Satuan...</option>
                                                        {units.map((unit) => (
                                                            <option key={unit.id} value={unit.id}>
                                                                {unit.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label htmlFor="unit_id">Satuan</label>
                                                    {errors.unit_id && <div className="invalid-feedback">{errors.unit_id}</div>}
                                                </div>
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="number"
                                                        className={`form-control rounded-0 ${errors.quantity ? "is-invalid" : ""}`}
                                                        id="quantity"
                                                        placeholder="Jumlah"
                                                        value={data.quantity}
                                                        onChange={(e) => setData("quantity", e.target.value)}
                                                        min="1"
                                                        step="1"
                                                        required
                                                    />
                                                    <label htmlFor="quantity">Jumlah</label>
                                                    {errors.quantity && (
                                                        <div className="invalid-feedback">{errors.quantity}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Unit Price */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="number"
                                                        className={`form-control rounded-0 ${errors.unit_price ? "is-invalid" : ""}`}
                                                        id="unit_price"
                                                        placeholder="Harga Satuan"
                                                        value={data.unit_price}
                                                        onChange={(e) => setData("unit_price", e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                        disabled
                                                    />
                                                    <label htmlFor="unit_price">Harga Satuan (Rp)</label>
                                                    {errors.unit_price && (
                                                        <div className="invalid-feedback">{errors.unit_price}</div>
                                                    )}
                                                </div>
                                            </div>

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
                                                            <i className="bi bi-save me-2"></i>Simpan Item
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
