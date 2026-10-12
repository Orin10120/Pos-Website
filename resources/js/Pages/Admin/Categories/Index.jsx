import { useState } from "react"
import { usePage, Link, router, Head } from "@inertiajs/react"
import Swal from "sweetalert2"
import Pagination from "../../../Components/Pagination"
import AdminLayout from "../../../Layouts/AdminLayout"
import hasAnyPermission from "../../../utils/hasAnyPermission"

export default function CategoryIndex() {
    const { categories } = usePage().props
    const [filterText, setFilterText] = useState("")

    const filteredCategories = categories.data.filter((category) =>
        category.name.toLowerCase().includes(filterText.toLowerCase())
    )

    const handleDelete = (id, name) => {
        Swal.fire({
            title: "Hapus Kategori?",
            text: `Kategori "${name}" akan dihapus permanen.`,
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
                router.delete(`/admin/categories/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: "Berhasil!",
                            text: "Kategori berhasil dihapus.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                        })
                    },
                    onError: () => {
                        Swal.fire(
                            "Gagal!",
                            "Terjadi kesalahan saat menghapus kategori.",
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
                <title>Kategori - AlphaPOS</title>
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
                                    Categories
                                </li>
                            </ol>
                        </nav>
                        <h2 className="h4 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-list-nested text-primary"></i> Manajemen Kategori
                        </h2>
                    </div>

                    {hasAnyPermission(["categories.create"]) && (
                        <Link
                            href="/admin/categories/create"
                            className="btn btn-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                        >
                            <i className="bi bi-plus-lg fs-6"></i>
                            <span>Tambah Kategori</span>
                        </Link>
                    )}
                </div>

                {/* Main Card Container */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {/* Search Bar Header */}
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
                                        placeholder="Cari nama kategori..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="table-responsive">
                        <table className="table align-middle table-hover mb-0">
                            <thead className="table-light text-uppercase fs-8 text-muted fw-bold">
                                <tr>
                                    <th className="ps-4 py-3" style={{ width: "60px" }}>No</th>
                                    <th className="py-3">Nama Kategori</th>
                                    <th className="py-3">Deskripsi</th>
                                    <th className="text-end pe-4 py-3" style={{ width: "160px" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category, index) => (
                                        <tr key={category.id}>
                                            <td className="ps-4 text-muted fw-medium">
                                                {index + 1 + (categories.current_page - 1) * categories.per_page}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-3 bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                                                        style={{ width: "38px", height: "38px", fontSize: "0.9rem" }}
                                                    >
                                                        {category.name ? category.name.charAt(0).toUpperCase() : "C"}
                                                    </div>
                                                    <span className="fw-semibold text-dark">
                                                        {category.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-muted text-truncate d-inline-block" style={{ maxWidth: "350px" }}>
                                                    {category.description || "-"}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-inline-flex gap-1">
                                                    {hasAnyPermission(["categories.edit"]) && (
                                                        <Link
                                                            href={`/admin/categories/${category.id}/edit`}
                                                            className="btn btn-light text-success rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                            title="Edit Kategori"
                                                        >
                                                            <i className="bi bi-pencil-square"></i>
                                                            <span className="fs-8 fw-medium">Edit</span>
                                                        </Link>
                                                    )}
                                                    {hasAnyPermission(["categories.delete"]) && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light text-danger rounded-2 px-2.5 py-1.5 d-inline-flex align-items-center gap-1 border shadow-sm"
                                                            onClick={() => handleDelete(category.id, category.name)}
                                                            title="Hapus Kategori"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                            <span className="fs-8 fw-medium">Hapus</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <div className="d-flex flex-column align-items-center justify-content-center">
                                                <i className="bi bi-folder2-open fs-1 text-secondary mb-2 opacity-50"></i>
                                                <p className="mb-0 fw-medium text-muted">Tidak ada kategori ditemukan</p>
                                                <small className="text-muted">Coba kata kunci pencarian lain</small>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination */}
                    {categories.links && categories.links.length > 0 && (
                        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
                            <span className="fs-7 text-muted">
                                Menampilkan {categories.from || 0} - {categories.to || 0} dari {categories.total || 0} data
                            </span>
                            <Pagination links={categories.links} />
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    )
}
