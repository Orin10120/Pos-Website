import { useState } from "react"
import { usePage, useForm, Head, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function UserEdit() {
    const { roles, stores, user } = usePage().props

    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

    const { data, setData, put, processing, reset, errors, transform } = useForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
        roles: user.roles && user.roles.length > 0 ? user.roles[0].name : "",
        store_id: user.store_id || "",
    })

    const updateUser = (e) => {
        e.preventDefault()

        // Hapus password dari payload jika tidak diisi oleh admin
        transform((data) => {
            const payload = { ...data }
            if (!payload.password) {
                delete payload.password
                delete payload.password_confirmation
            }
            return payload
        })

        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Data user berhasil diperbarui",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                })
            },
        })
    }

    return (
        <>
            <Head>
                <title>Edit User - EasyPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h3 className="card-title fw-bold mb-0 fs-5">
                                        <i className="bi bi-person-gear me-2"></i>Edit User
                                    </h3>
                                    <Link href="/admin/users" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={updateUser}>
                                        <div className="row g-3">
                                            {/* Name */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        id="namaLengkap"
                                                        type="text"
                                                        name="name"
                                                        className={`form-control rounded-0 ${errors.name ? "is-invalid" : ""}`}
                                                        value={data.name}
                                                        onChange={(e) => setData("name", e.target.value)}
                                                        placeholder="Nama Lengkap"
                                                    />
                                                    <label htmlFor="namaLengkap">Nama Lengkap</label>
                                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        className={`form-control rounded-0 ${errors.email ? "is-invalid" : ""}`}
                                                        value={data.email}
                                                        onChange={(e) => setData("email", e.target.value)}
                                                        placeholder="Email"
                                                    />
                                                    <label htmlFor="email">Email</label>
                                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                </div>
                                            </div>

                                            {/* Password Section */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3 position-relative">
                                                    <input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        className={`form-control rounded-0 ${errors.password ? "is-invalid" : ""}`}
                                                        value={data.password}
                                                        onChange={(e) => setData("password", e.target.value)}
                                                        placeholder="Password Baru"
                                                    />
                                                    <label htmlFor="password">Password Baru</label>
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        className="btn btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-transparent"
                                                        style={{ zIndex: 5 }}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                    </button>
                                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-floating mb-3 position-relative">
                                                    <input
                                                        id="password_confirmation"
                                                        type={showPasswordConfirmation ? "text" : "password"}
                                                        name="password_confirmation"
                                                        className={`form-control rounded-0 ${errors.password_confirmation ? "is-invalid" : ""}`}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                                        placeholder="Konfirmasi Password"
                                                    />
                                                    <label htmlFor="password_confirmation">Konfirmasi Password</label>
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        className="btn btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2 border-0 bg-transparent"
                                                        style={{ zIndex: 5 }}
                                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    >
                                                        <i className={`bi ${showPasswordConfirmation ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                    </button>
                                                    {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <p className="text-muted small mb-0 ms-1">
                                                    (Kosongkan password jika tidak ingin mengubah password)
                                                </p>
                                            </div>

                                            {/* Roles */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <label className="fw-semibold">Hak Akses</label>
                                                    <div className="row g-3 mt-2">
                                                        {roles.map((role) => (
                                                            <div className="col-md-4" key={role.id}>
                                                                <div className="form-check">
                                                                    <input
                                                                        type="radio"
                                                                        name="roles"
                                                                        value={role.name}
                                                                        className="form-check-input"
                                                                        id={`role-${role.id}`}
                                                                        checked={data.roles === role.name}
                                                                        onChange={(e) => setData("roles", e.target.value)}
                                                                    />
                                                                    <label
                                                                        className="form-check-label text-capitalize"
                                                                        htmlFor={`role-${role.id}`}
                                                                    >
                                                                        {role.name}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {errors.roles && <div className="text-danger small mt-2">{errors.roles}</div>}
                                                </div>
                                            </div>

                                            {/* Store */}
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Toko</label>
                                                <select
                                                    className={`form-select ${errors.store_id ? "is-invalid" : ""}`}
                                                    value={data.store_id}
                                                    onChange={(e) => setData("store_id", e.target.value)}
                                                >
                                                    <option value="">Pilih Toko...</option>
                                                    {stores.map((store) => (
                                                        <option key={store.id} value={store.id}>
                                                            {store.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.store_id && <div className="invalid-feedback">{errors.store_id}</div>}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex justify-content-between border-top mt-4 pt-4">
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
