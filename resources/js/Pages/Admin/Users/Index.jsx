import { useState } from "react"
import { Head, usePage, Link, router } from "@inertiajs/react"
import Swal from "sweetalert2"
import Pagination from "../../../Components/Pagination"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function UserIndex() {
    const { users, isAdmin = false, filters } = usePage().props
    const [searchTerm, setSearchTerm] = useState(filters?.q || "")

    // Filter lokal berdasarkan input pencarian
    const filteredUsers = users.data.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (id) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data ini akan dihapus secara permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
            customClass: {
                popup: "rounded-4",
                confirmButton: "btn btn-danger rounded-pill px-4 me-2",
                cancelButton: "btn btn-secondary rounded-pill px-4"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/users/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: "Dihapus!",
                            text: "Data telah berhasil dihapus.",
                            icon: "success",
                            customClass: {
                                confirmButton: "btn btn-success rounded-pill px-4"
                            },
                            buttonsStyling: false
                        })
                    },
                })
            }
        })
    }

    return (
        <>
            <Head>
                <title>Users - AlphaPOS</title>
            </Head>
            <AdminLayout>
                {/* Header & Breadcrumb */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-1 small text-muted">
                                <li className="breadcrumb-item">
                                    <Link href="/admin" className="text-decoration-none text-muted">
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">
                                    Users
                                </li>
                            </ol>
                        </nav>
                        <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
                            <i className="bi bi-people-fill text-success"></i> User Management
                        </h4>
                    </div>

                    {isAdmin && (
                        <div>
                            <Link
                                href="/admin/users/create"
                                className="btn btn-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                            >
                                <i className="bi bi-plus-lg fs-6"></i>
                                <span className="fw-medium">Tambah User</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Filter & Table Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3 px-4">
                        <div className="row align-items-center">
                            <div className="col-md-4 col-lg-3">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted rounded-start-pill ps-3">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-start-0 rounded-end-pill fs-7 shadow-none"
                                        placeholder="Cari Nama atau Email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light border-bottom">
                                    <tr>
                                        <th scope="col" className="text-center py-3 text-secondary text-uppercase fs-7 fw-bold" style={{ width: "70px" }}>No.</th>
                                        <th scope="col" className="py-3 text-secondary text-uppercase fs-7 fw-bold">User Name</th>
                                        <th scope="col" className="py-3 text-secondary text-uppercase fs-7 fw-bold">Email Address</th>
                                        <th scope="col" className="py-3 text-secondary text-uppercase fs-7 fw-bold">Store</th>
                                        <th scope="col" className="py-3 text-secondary text-uppercase fs-7 fw-bold">Role</th>
                                        {isAdmin && (
                                            <th scope="col" className="text-center py-3 text-secondary text-uppercase fs-7 fw-bold" style={{ width: "180px", minWidth: "180px" }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, index) => (
                                            <tr key={user.id}>
                                                <td className="text-center text-muted fw-medium">
                                                    {index + 1 + (users.current_page - 1) * users.per_page}
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{user.name}</div>
                                                </td>
                                                <td className="text-muted">{user.email}</td>
                                                <td>
                                                    {user.store ? (
                                                        <span className="badge bg-light text-dark fw-medium border px-2.5 py-1.5 rounded-2">
                                                            <i className="bi bi-shop me-1 text-secondary"></i>
                                                            {user.store.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted small fst-italic">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {user.roles && user.roles.length > 0 ? (
                                                            user.roles.map((role, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="badge rounded-pill bg-success text-white fw-normal px-3 py-1.5 shadow-sm"
                                                                    style={{ fontSize: "0.8rem" }}
                                                                >
                                                                    {role.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted small fst-italic">Tanpa Role</span>
                                                        )}
                                                    </div>
                                                </td>
                                                {isAdmin && (
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center align-items-center gap-2">
                                                            <Link
                                                                href={`/admin/users/${user.id}/edit`}
                                                                className="btn btn-primary btn-light text-success rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                                title="Edit Role"
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                                <span className="fw-medium">Edit</span>
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(role.id)}
                                                                className="btn btn-primary btn-light text-danger rounded-pill px-3 d-inline-flex align-items-center gap-1 border-0 shadow-sm"
                                                                title="Delete Role"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                                <span className="fw-medium">Hapus</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="text-center py-5 text-muted">
                                                <i className="bi bi-person-x fs-2 d-block mb-2 text-secondary"></i>
                                                Data user tidak ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {users.links && (
                        <div className="card-footer bg-white border-0 py-3">
                            <Pagination links={users.links} />
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    )
}
