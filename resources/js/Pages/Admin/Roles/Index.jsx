import { Link, usePage, router, Head } from "@inertiajs/react"
import Swal from "sweetalert2"
import Pagination from "../../../Components/Pagination"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function RoleIndex() {
    const { roles, isAdmin = false } = usePage().props

    const handleDelete = (id) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data ini akan dihapus secara permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
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
                router.delete(`/admin/roles/${id}`, {
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
                <title>Roles - AlphaPOS</title>
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
                                    Roles
                                </li>
                            </ol>
                        </nav>
                        <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
                            <i className="bi bi-shield-lock text-success"></i> Roles & Permissions
                        </h4>
                    </div>

                    {isAdmin && (
                        <div>
                            <Link
                                href="/admin/roles/create"
                                className="btn btn-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                            >
                                <i className="bi bi-plus-lg fs-6"></i>
                                <span className="fw-medium">Tambah Role</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Table Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light border-bottom">
                                    <tr>
                                        <th scope="col" className="text-center py-3 text-secondary text-uppercase fs-7 fw-bold" style={{ width: "70px" }}>No.</th>
                                        <th scope="col" className="py-3 text-secondary text-uppercase fs-7 fw-bold" style={{ width: "150px" }}>Role Name</th>
                                        <th scope="col" className="py-3 text-secondary text-uppercase fs-7 fw-bold">Permissions</th>
                                        {isAdmin && (
                                            <th scope="col" className="text-center py-3 text-secondary text-uppercase fs-7 fw-bold" style={{ width: "200px", minWidth: "200px" }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.data.length > 0 ? (
                                        roles.data.map((role, index) => (
                                            <tr key={role.id}>
                                                <td className="text-center text-muted fw-medium">
                                                    {index + 1 + (roles.current_page - 1) * roles.per_page}
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{role.name}</div>
                                                </td>
                                                <td>
                                                    {/* Kapsul Permission Mirip Gambar */}
                                                    <div className="d-flex flex-wrap gap-2 py-2">
                                                        {role.permissions && role.permissions.length > 0 ? (
                                                            role.permissions.map((permission, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="badge rounded-pill bg-success text-white fw-normal px-3 py-2 shadow-sm"
                                                                    style={{ fontSize: "0.825rem", letterSpacing: "0.3px" }}
                                                                >
                                                                    {permission.name.replace(/[._-]/g, ' ')}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted small fst-italic">Tidak ada permission</span>
                                                        )}
                                                    </div>
                                                </td>
                                                {isAdmin && (
                                                    <td className="text-center">
                                                        {/* Tombol Action Edit & Delete Persis Gambar */}
                                                        <div className="d-flex justify-content-center align-items-center gap-2">
                                                            <Link
                                                                href={`/admin/roles/${role.id}/edit`}
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
                                            <td colSpan={isAdmin ? 4 : 3} className="text-center py-5 text-muted">
                                                <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                                                Belum ada data role.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {roles.links && (
                        <div className="card-footer bg-white border-0 py-3">
                            <Pagination links={roles.links} />
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    )
}
