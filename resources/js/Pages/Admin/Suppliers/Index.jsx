import { useState, useEffect } from "react"
import { Head, Link, router, usePage } from "@inertiajs/react"
import Swal from "sweetalert2"
import Pagination from "../../../Components/Pagination"
import AdminLayout from "../../../Layouts/AdminLayout"
import hasAnyPermission from "../../../utils/hasAnyPermission"

export default function SupplierIndex() {
    const { suppliers, filters = {} } = usePage().props

    const [search, setSearch] = useState(filters.search || "")
    const [status, setStatus] = useState(filters.status || "")

    // Debounce search agar request ke server efisien saat mengetik
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || "") || status !== (filters.status || "")) {
                router.get(
                    "/admin/suppliers",
                    { search, status },
                    { preserveState: true, replace: true }
                )
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [search, status])

    const handleDelete = (id, name) => {
        Swal.fire({
            title: "Hapus Supplier?",
            text: `Data supplier "${name}" akan dihapus permanen.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            customClass: {
                popup: "rounded-4 border-0 shadow-lg",
                confirmButton: "btn btn-danger px-4 rounded-3",
                cancelButton: "btn btn-light px-4 rounded-3",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/suppliers/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: "Berhasil!",
                            text: "Supplier berhasil dihapus.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        })
                    },
                    onError: () => {
                        Swal.fire(
                            "Gagal!",
                            "Terjadi kesalahan saat menghapus supplier.",
                            "error"
                        )
                    },
                })
            }
        })
    }

    return (
        <>
            <Head>
                <title>Suppliers — AlphaPOS</title>
            </Head>
            <AdminLayout>
                {/* Header & Breadcrumb */}
                <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-3 mb-4">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-1 fs-7">
                                <li className="breadcrumb-item">
                                    <Link href="/admin" className="text-decoration-none text-muted">
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
                                    Suppliers
                                </li>
                            </ol>
                        </nav>
                        <h2 className="h4 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-truck text-primary"></i> Kelola Supplier
                        </h2>
                    </div>

                    {hasAnyPermission(["suppliers.create"]) && (
                        <Link
                            href="/admin/suppliers/create"
                            className="btn btn-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                        >
                            <i className="bi bi-plus-lg fs-6"></i>
                            <span>Tambah Supplier</span>
                        </Link>
                    )}
                </div>

                {/* Main Card Container */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {/* Filter & Search Bar */}
                    <div className="card-header bg-white border-bottom py-3 px-4">
                        <div className="row g-3 align-items-center">
                            <div className="col-12 col-md-6 col-lg-4">
                                <div className="input-group search-box">
                                    <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted ps-3">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-start-0 rounded-end-3 py-2"
                                        placeholder="Cari nama atau nomor telepon..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-4 col-lg-3">
                                <select
                                    className="form-select bg-light border-0 py-2 rounded-3"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Non-Aktif</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table align-middle table-hover mb-0">
                            <thead className="table-light text-uppercase fs-8 text-muted fw-bold">
                                <tr>
                                    <th className="ps-4 py-3" style={{ width: "60px" }}>No</th>
                                    <th className="py-3">Supplier</th>
                                    <th className="py-3">Kontak</th>
                                    <th className="py-3">Alamat</th>
                                    <th className="py-3">Status</th>
                                    <th className="text-end pe-4 py-3" style={{ width: "120px" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.data && suppliers.data.length > 0 ? (
                                    suppliers.data.map((supplier, index) => (
                                        <tr key={supplier.id} className="transition-all">
                                            <td className="ps-4 text-muted fw-medium">
                                                {index + 1 + (suppliers.current_page - 1) * suppliers.per_page}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                                                        style={{ width: "40px", height: "40px", fontSize: "0.9rem" }}
                                                    >
                                                        {supplier.name ? supplier.name.charAt(0).toUpperCase() : "S"}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark">
                                                            {supplier.name || "Tanpa Nama"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-dark fw-medium">
                                                    <i className="bi bi-telephone text-muted me-1 fs-7"></i>
                                                    {supplier.phone || "-"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-muted text-truncate" style={{ maxWidth: "250px" }}>
                                                    {supplier.address || "-"}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2.5 py-1.5 fs-8 fw-semibold ${
                                                        supplier.status === "active"
                                                            ? "bg-success-subtle text-success"
                                                            : "bg-secondary-subtle text-secondary"
                                                    }`}
                                                >
                                                    <span
                                                        className={`rounded-circle d-inline-block ${
                                                            supplier.status === "active" ? "bg-success" : "bg-secondary"
                                                        }`}
                                                        style={{ width: "6px", height: "6px" }}
                                                    ></span>
                                                    {supplier.status === "active" ? "Aktif" : "Non-Aktif"}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-inline-flex gap-1">
                                                    {hasAnyPermission(["suppliers.edit"]) && (
                                                        <Link
                                                            href={`/admin/suppliers/${supplier.id}/edit`}
                                                            className="btn btn-light text-success rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                            title="Edit Supplier"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Link>
                                                    )}
                                                    {hasAnyPermission(["suppliers.delete"]) && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-light text-danger rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                            onClick={() => handleDelete(supplier.id, supplier.name)}
                                                            title="Hapus Supplier"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <div className="d-flex flex-column align-items-center justify-content-center">
                                                <i className="bi bi-inbox fs-1 text-secondary mb-2 opacity-50"></i>
                                                <p className="mb-0 fw-medium">Tidak ada data supplier ditemukan</p>
                                                <small className="text-muted">Coba ubah filter pencarian kamu</small>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {suppliers.links && suppliers.links.length > 0 && (
                        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
                            <span className="fs-7 text-muted">
                                Menampilkan {suppliers.from || 0} - {suppliers.to || 0} dari {suppliers.total || 0} supplier
                            </span>
                            <Pagination links={suppliers.links} />
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    )
}
