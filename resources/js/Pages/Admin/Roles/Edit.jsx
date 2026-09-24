import { Head, useForm, usePage, Link } from '@inertiajs/react'
import Swal from 'sweetalert2'
import AdminLayout from "../../../Layouts/AdminLayout"

export default function RoleEdit() {
    const { permissions, role, rolePermissions } = usePage().props

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: rolePermissions || [],
    })

    const handlePermissionChange = (e) => {
        const { value, checked } = e.target
        const permId = parseInt(value)
        setData('permissions', checked
            ? [...data.permissions, permId]
            : data.permissions.filter(id => id !== permId)
        )
    }

    const handleCheckAllChange = (e) => {
        const { checked } = e.target
        setData('permissions', checked ? permissions.map(p => p.id) : [])
    }

    const updateRole = async (e) => {
        e.preventDefault()
        put(`/admin/roles/${role.id}`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Role berhasil diperbarui.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                })
            },
            onError: () => {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat memperbarui role.',
                    icon: 'error',
                    showConfirmButton: true,
                })
            },
        })
    }

    return (
        <>
            <Head>
                <title>Edit Role - EasyPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-shield-fill-check me-2"></i>Edit Role
                                    </h5>
                                    <Link
                                        href="/admin/roles"
                                        className="btn btn-outline-secondary btn-sm"
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={updateRole}>
                                        <div className="row g-3">
                                            {/* Role Name Input */}
                                            <div className="col-md-12">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        className={`form-control rounded-0 ${errors.name ? "is-invalid" : ""}`}
                                                        id="roleName"
                                                        placeholder="Nama Role"
                                                        value={data.name}
                                                        onChange={(e) => setData("name", e.target.value)}
                                                        autoComplete="off"
                                                    />
                                                    <label htmlFor="roleName">Nama Role</label>
                                                    {errors.name && (
                                                        <div className="invalid-feedback">{errors.name}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* Permissions Section */}
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <label className="fw-semibold mb-0">Hak Akses</label>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="checkAllPermissions"
                                                        onChange={handleCheckAllChange}
                                                        checked={data.permissions.length === permissions.length}
                                                    />
                                                    <label className="form-check-label text-muted small" htmlFor="checkAllPermissions">
                                                        Pilih Semua
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="row g-2">
                                                {permissions.map((permission) => (
                                                    <div className="col-md-4" key={permission.id}>
                                                        <div className="form-check form-switch">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                value={permission.id}
                                                                onChange={handlePermissionChange}
                                                                id={`perm-${permission.id}`}
                                                                checked={data.permissions.includes(permission.id)}
                                                            />
                                                            <label
                                                                className="form-check-label text-capitalize"
                                                                htmlFor={`perm-${permission.id}`}
                                                            >
                                                                {permission.name.replace(/-/g, ' ')}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.permissions && (
                                                <div className="text-danger small mt-2">{errors.permissions}</div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex justify-content-between border-top mt-4 pt-4">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => setData('permissions', rolePermissions)}
                                            >
                                                <i className="bi bi-x-circle me-2"></i>Reset
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
                                                        <i className="bi bi-save me-2"></i>Simpan Perubahan
                                                    </>
                                                )}
                                            </button>
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
