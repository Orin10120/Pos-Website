import { Link, Head, usePage } from "@inertiajs/react"
import AdminLayout from "../../../Layouts/AdminLayout"
import { formatRupiah } from "../../../utils/rupiah"

export default function PurchaseOrderItemsIndex() {
    const { po, items } = usePage().props

    return (
        <>
            <Head title={`Item PO - ${po.po_number}`} />
            <AdminLayout>
                <div className="container-fluid py-4">
                    {/* Header & Breadcrumb / Back Button */}
                    <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-3 mb-4">
                        <div>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-1 fs-7">
                                    <li className="breadcrumb-item">
                                        <Link href="/admin" className="text-decoration-none text-muted">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link href="/admin/po" className="text-decoration-none text-muted">
                                            Purchase Orders
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
                                        Items
                                    </li>
                                </ol>
                            </nav>
                            <h2 className="h4 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                <i className="bi bi-cart-check text-primary"></i> Detail Item PO: <span className="text-primary font-monospace">{po.po_number}</span>
                            </h2>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <Link
                                href="/admin/po"
                                className="btn btn-light border d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm text-secondary"
                            >
                                <i className="bi bi-arrow-left"></i>
                                <span>Kembali</span>
                            </Link>

                            <Link
                                href={`/admin/po/${po.id}/items/create`}
                                className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
                            >
                                <i className="bi bi-plus-lg fs-6"></i>
                                <span>Tambah Item</span>
                            </Link>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        {/* Card Header Info */}
                        <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                            <span className="fw-semibold text-secondary fs-7">
                                Daftar barang untuk Purchase Order ini
                            </span>
                            <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill fw-semibold">
                                Total Item: {items.length}
                            </span>
                        </div>

                        {/* Table Area */}
                        <div className="table-responsive">
                            <table className="table align-middle table-hover mb-0">
                                <thead className="table-light text-uppercase fs-8 text-muted fw-bold">
                                    <tr>
                                        <th className="ps-4 py-3 text-center" style={{ width: "60px" }}>No</th>
                                        <th className="py-3">Produk</th>
                                        <th className="py-3">Satuan (Unit)</th>
                                        <th className="py-3">Quantity</th>
                                        <th className="py-3">Harga Satuan</th>
                                        <th className="text-end pe-4 py-3">Total Harga</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length > 0 ? (
                                        items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="ps-4 text-center text-muted fw-medium">
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-3 bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                                                            style={{ width: "38px", height: "38px", fontSize: "0.9rem" }}
                                                        >
                                                            <i className="bi bi-box-seam fs-6"></i>
                                                        </div>
                                                        <div>
                                                            <span className="fw-semibold text-dark d-block">
                                                                {item.product?.name || "Produk tidak tersedia"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border px-2.5 py-1 fw-normal">
                                                        {item.unit?.name || "-"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-semibold text-dark">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-secondary">
                                                        {formatRupiah(item.unit_price)}
                                                    </span>
                                                </td>
                                                <td className="text-end pe-4 fw-bold text-dark">
                                                    {formatRupiah(item.quantity * item.unit_price)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="d-flex flex-column align-items-center justify-content-center">
                                                    <i className="bi bi-inbox fs-1 text-secondary mb-2 opacity-50"></i>
                                                    <p className="mb-0 fw-medium text-muted">Belum ada item ditambahkan pada PO ini</p>
                                                    <small className="text-muted">Klik tombol "Tambah Item" di atas untuk mulai</small>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}
