import { useState } from "react"
import { usePage, Link, router, Head } from "@inertiajs/react"
import Swal from "sweetalert2"
import Pagination from "../../../Components/Pagination"
import AdminLayout from "../../../Layouts/AdminLayout"
import hasAnyPermission from "../../../utils/hasAnyPermission"

export default function StoreIndex() {
    const { stores = { data: [], links: [] }, provinces = [], isAdmin = false } = usePage().props

    const [filterText, setFilterText] = useState("")
    const [provinceFilter, setProvinceFilter] = useState("")

    const filteredStores = stores.data.filter(
        (store) =>
            store.name.toLowerCase().includes(filterText.toLowerCase()) &&
            (provinceFilter ? store.province?.name === provinceFilter : true)
    )

    const handleDelete = (id) => {
        Swal.fire({
            title: "Hapus Toko?",
            text: "Data toko yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            customClass: {
                popup: "rounded-4 shadow-sm",
                confirmButton: "btn btn-danger px-4 rounded-3",
                cancelButton: "btn btn-light px-4 rounded-3 me-2"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/stores/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: "Terhapus!",
                            text: "Toko berhasil dihapus.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                            customClass: { popup: "rounded-4" }
                        })
                    },
                    onError: () => {
                        Swal.fire({
                            title: "Gagal!",
                            text: "Terjadi kesalahan saat menghapus toko.",
                            icon: "error",
                            customClass: { popup: "rounded-4" }
                        })
                    },
                })
            }
        })
    }

    // Cek apakah user punya setidaknya salah satu izin
    const canEdit = hasAnyPermission(["stores.edit"]) || isAdmin
    const canDelete = hasAnyPermission(["stores.delete"]) || isAdmin
    const showActionColumn = canEdit || canDelete

    return (
        <>
            <Head>
                <title>Stores - AlphaPOS</title>
            </Head>
            <AdminLayout>
                {/* Header & Breadcrumb */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-1 text-muted fs-7">
                                <li className="breadcrumb-item">
                                    <Link href="/admin" className="text-decoration-none text-secondary">
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active text-dark fw-medium" aria-current="page">
                                    Stores
                                </li>
                            </ol>
                        </nav>
                        <h2 className="fw-bold mb-0 text-dark tracking-tight">Manajemen Toko</h2>
                    </div>

                    {(hasAnyPermission(["stores.create"]) || isAdmin) && (
                        <div>
                            <Link
                                href="/admin/stores/create"
                                className="btn btn-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                            >
                                <i className="bi bi-plus-lg fs-6"></i>
                                <span className="fw-medium">Tambah Toko</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Card Wrapper */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {/* Integrated Filter Bar */}
                    <div className="card-header bg-white border-bottom-0 p-4 pb-2">
                        <div className="row g-3 align-items-center justify-content-between">
                            <div className="col-12 col-md-5 col-lg-4">
                                <div className="input-group search-box">
                                    <span className="input-group-text bg-light border-0 text-muted ps-3">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 ps-2 py-2"
                                        placeholder="Cari nama toko..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-12 col-md-4 col-lg-3">
                                <select
                                    className="form-select bg-light border-0 py-2"
                                    value={provinceFilter}
                                    onChange={(e) => setProvinceFilter(e.target.value)}
                                >
                                    <option value="">Semua Provinsi</option>
                                    {provinces.map((province) => (
                                        <option key={province.id} value={province.name}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table align-middle text-nowrap mb-0">
                                <thead className="bg-light text-secondary text-uppercase fs-8 tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 text-center" style={{ width: "60px" }}>No</th>
                                        <th className="py-3 px-4">Nama Toko</th>
                                        <th className="py-3 px-4">Alamat</th>
                                        <th className="py-3 px-4">Provinsi</th>
                                        <th className="py-3 px-4">Kota/Kabupaten</th>
                                        {showActionColumn && (
                                            <th className="py-3 px-4 text-end" style={{ width: "120px" }}>
                                                Aksi
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStores.length > 0 ? (
                                        filteredStores.map((store, index) => (
                                            <tr key={store.id} className="align-middle">
                                                <td className="text-center text-muted fw-medium py-3 px-4">
                                                    {index + 1 + (stores.current_page - 1) * stores.per_page}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                                                            <i className="bi bi-shop fs-5"></i>
                                                        </div>
                                                        <div>
                                                            <span className="fw-semibold text-dark d-block">
                                                                {store.name || "Nama tidak tersedia"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-secondary">
                                                    {store.address || "-"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {store.province?.name ? (
                                                        <span className="badge bg-light text-dark border font-normal">
                                                            {store.province.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-secondary">
                                                    {store.city?.name || "-"}
                                                </td>
                                                {isAdmin && (
                                                    <td className="py-3 px-4 text-end">
                                                        <div className="d-inline-flex align-items-center gap-1">
                                                            {canEdit && (
                                                                <Link
                                                                    href={`/admin/stores/${store.id}/edit`}
                                                                    className="btn btn-light text-success rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                                    title="Edit Store"
                                                                >
                                                                    <i className="bi bi-pencil-square"></i>
                                                                    <span className="fw-medium">Edit</span>
                                                                </Link>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => handleDelete(store.id)}
                                                                    className="btn btn-light text-danger rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                                    title="Hapus Store"
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                    <span className="fw-medium">Hapus</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={showActionColumn ? 6 : 5} className="text-center py-5">
                                                <div className="py-4">
                                                    <i className="bi bi-shop-window fs-1 text-muted opacity-50 d-block mb-2"></i>
                                                    <p className="text-muted mb-0 fw-medium">Tidak ada data toko ditemukan</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Pagination */}
                    <div className="card-footer bg-white border-top-0 p-4">
                        <Pagination links={stores.links || []} />
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}