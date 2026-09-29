import { useState } from "react"
import { Head, usePage, Link, router } from "@inertiajs/react"
import Swal from "sweetalert2"
import Pagination from "../../../Components/Pagination"
import AdminLayout from "../../../Layouts/AdminLayout"
import hasAnyPermission from "../../../utils/hasAnyPermission"

export default function CustomerIndex() {
    const { customers } = usePage().props
    const [filterText, setFilterText] = useState("")

    const filteredCustomers = customers.data.filter(
        (customer) =>
            (customer.name && customer.name.toLowerCase().includes(filterText.toLowerCase())) ||
            (customer.phone && customer.phone.toLowerCase().includes(filterText.toLowerCase()))
    )

    const handleDelete = (id) => {
        Swal.fire({
            title: "Hapus Customer?",
            text: "Data customer yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            customClass: {
                popup: "rounded-4 border-0 shadow-lg",
                confirmButton: "btn btn-danger rounded-3 px-4 me-2 fw-medium",
                cancelButton: "btn btn-light rounded-3 px-4 fw-medium",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/customers/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: "Berhasil!",
                            text: "Data customer telah dihapus.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                            customClass: {
                                popup: "rounded-4 border-0 shadow-lg",
                            },
                        })
                    },
                    onError: () => {
                        Swal.fire({
                            title: "Gagal!",
                            text: "Terjadi kesalahan saat menghapus customer.",
                            icon: "error",
                            customClass: {
                                popup: "rounded-4 border-0 shadow-lg",
                            },
                        })
                    },
                })
            }
        })
    }

    const getInitials = (name) => {
        if (!name) return "C"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
    }

    const renderGenderBadge = (gender) => {
        const normalized = gender?.toString().toLowerCase()
        if (normalized === "pria" || normalized === "male") {
            return (
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill fw-medium px-2.5 py-1 fs-8 d-inline-flex align-items-center gap-1">
                    <i className="bi bi-gender-male"></i> Pria
                </span>
            )
        }
        if (normalized === "wanita" || normalized === "female") {
            return (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill fw-medium px-2.5 py-1 fs-8 d-inline-flex align-items-center gap-1">
                    <i className="bi bi-gender-female"></i> Wanita
                </span>
            )
        }
        return (
            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill fw-normal px-2.5 py-1 fs-8">
                N/A
            </span>
        )
    }

    return (
        <>
            <Head>
                <title>Customers - AlphaPos</title>
            </Head>
            <AdminLayout>
                {/* Header & Breadcrumb */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-1 fs-7 text-muted">
                                <li className="breadcrumb-item">
                                    <Link href="/admin" className="text-decoration-none text-muted">
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active text-primary fw-semibold" aria-current="page">
                                    Customers
                                </li>
                            </ol>
                        </nav>
                        <div className="d-flex align-items-center gap-3">
                            <h4 className="fw-bold m-0 tracking-tight">Customer Management</h4>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 fs-7">
                                Total: {customers.total || customers.data.length} Customer
                            </span>
                        </div>
                    </div>

                    {hasAnyPermission(["customers.create"]) && (
                        <div>
                            <Link
                                href="/admin/customers/create"
                                className="btn btn-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                            >
                                <i className="bi bi-plus-lg fs-6"></i>
                                <span className="fw-medium">Tambah Customer</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    {/* Search Bar Header */}
                    <div className="card-header bg-white border-bottom border-light py-3 px-4">
                        <div className="row align-items-center justify-content-between g-3">
                            <div className="col-md-5 col-lg-4">
                                <div className="position-relative">
                                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 rounded-3 ps-5 pe-4 py-2 fs-7 shadow-none"
                                        placeholder="Cari nama atau nomor telepon..."
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                    />
                                    {filterText && (
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted text-decoration-none p-0"
                                            onClick={() => setFilterText("")}
                                        >
                                            <i className="bi bi-x-circle-fill"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 border-0">
                                <thead className="bg-light-subtle border-bottom">
                                    <tr>
                                        <th className="text-center py-3 text-secondary text-uppercase fs-8 fw-bold tracking-wider" style={{ width: "60px" }}>
                                            #
                                        </th>
                                        <th className="py-3 text-secondary text-uppercase fs-8 fw-bold tracking-wider">
                                            Customer
                                        </th>
                                        <th className="py-3 text-secondary text-uppercase fs-8 fw-bold tracking-wider">
                                            No. Telepon
                                        </th>
                                        <th className="py-3 text-secondary text-uppercase fs-8 fw-bold tracking-wider">
                                            Alamat
                                        </th>
                                        <th className="py-3 text-secondary text-uppercase fs-8 fw-bold tracking-wider">
                                            Gender
                                        </th>
                                        <th className="text-end py-3 pe-4 text-secondary text-uppercase fs-8 fw-bold tracking-wider" style={{ width: "120px" }}>
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map((customer, index) => (
                                            <tr key={customer.id} className="transition-all hover:bg-light">
                                                <td className="text-center text-muted fs-7">
                                                    {index + 1 + (customers.current_page - 1) * customers.per_page}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold fs-7 shadow-sm border border-primary-subtle flex-shrink-0"
                                                            style={{
                                                                width: "38px",
                                                                height: "38px",
                                                                backgroundColor: "#eef2ff",
                                                                color: "#4f46e5",
                                                            }}
                                                        >
                                                            {getInitials(customer.name)}
                                                        </div>
                                                        <div className="fw-semibold text-dark fs-7">
                                                            {customer.name || "Tidak Ada Nama"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fs-7 text-secondary">
                                                    {customer.phone ? (
                                                        <span className="d-inline-flex align-items-center gap-1.5">
                                                            <i className="bi bi-telephone text-muted fs-8"></i>
                                                            {customer.phone}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted fst-italic fs-8">Tidak ada telepon</span>
                                                    )}
                                                </td>
                                                <td className="fs-7 text-secondary" style={{ maxWidth: "250px" }}>
                                                    <div className="text-truncate" title={customer.address}>
                                                        {customer.address || <span className="text-muted fst-italic fs-8">Tidak ada alamat</span>}
                                                    </div>
                                                </td>
                                                <td>{renderGenderBadge(customer.gender)}</td>
                                                <td className="text-end pe-4">
                                                    <div className="d-inline-flex align-items-center gap-1">
                                                        {hasAnyPermission(["customers.edit"]) && (
                                                            <Link
                                                                href={`/admin/customers/${customer.id}/edit`}
                                                                className="btn btn-primary btn-light text-success rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                                title="Edit Role"
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                                <span className="fw-medium">Edit</span>
                                                            </Link>
                                                        )}
                                                        {hasAnyPermission(["customers.delete"]) && (
                                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                            <button
                                                                onClick={() => handleDelete(customer.id)}
                                                                className="btn btn-primary btn-light text-danger rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                                title="Delete Role"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                                <span className="fw-medium">Hapus</span>
                                                            </button>
                                                        </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                <div className="py-4">
                                                    <i className="bi bi-person-x fs-1 d-block mb-3 text-secondary opacity-50"></i>
                                                    <h6 className="fw-semibold text-dark mb-1">Customer Tidak Ditemukan</h6>
                                                    <p className="fs-7 text-muted mb-0">Coba cari dengan kata kunci nama atau telepon lain.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {customers.links && (
                        <div className="card-footer bg-white border-top border-light py-3 px-4 d-flex justify-content-between align-items-center">
                            <Pagination links={customers.links} />
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    )
}