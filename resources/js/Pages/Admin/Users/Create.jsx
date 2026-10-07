import { usePage, useForm, Head, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function UserCreate() {
    const { roles, stores } = usePage().props

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        roles: "",
        enroll_face: false,
        store_id: "",
    })

    const handleReset = () => {
        reset()
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        post("/admin/users", {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "User berhasil ditambahkan!",
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
                <title>Create User - EasyPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h3 className="card-title fw-bold mb-0 fs-5">
                                        <i className="bi bi-person-plus me-2"></i>Tambah User Baru
                                    </h3>
                                    <Link href="/admin/users" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
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
                                                        placeholder="Nama Lengkap *"
                                                    />
                                                    <label htmlFor="namaLengkap">Nama Lengkap <span className="text-danger">*</span></label>
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
                                                        placeholder="Email *"
                                                    />
                                                    <label htmlFor="email">Email <span className="text-danger">*</span></label>
                                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        className={`form-control rounded-0 ${errors.password ? "is-invalid" : ""}`}
                                                        value={data.password}
                                                        onChange={(e) => setData("password", e.target.value)}
                                                        placeholder="Password *"
                                                    />
                                                    <label htmlFor="password">Password <span className="text-danger">*</span></label>
                                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                                </div>
                                            </div>

                                            {/* Password Confirmation */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        id="password_confirmation"
                                                        type="password"
                                                        name="password_confirmation"
                                                        className={`form-control rounded-0 ${errors.password_confirmation ? "is-invalid" : ""}`}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                                        placeholder="Konfirmasi Password *"
                                                    />
                                                    <label htmlFor="password_confirmation">Konfirmasi Password <span className="text-danger">*</span></label>
                                                    {errors.password_confirmation && (
                                                        <div className="invalid-feedback">{errors.password_confirmation}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Face ID (Passkey) */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="enroll_face"
                                                            checked={data.enroll_face}
                                                            onChange={(e) => setData("enroll_face", e.target.checked)}
                                                        />
                                                        <label className="form-check-label fw-semibold" htmlFor="enroll_face">
                                                            <i className="bi bi-person-bounding-box me-2"></i>Daftarkan Face ID setelah user disimpan
                                                        </label>
                                                    </div>
                                                    <p className="small text-muted mt-2 mb-0">
                                                        Wajah tidak disimpan di server. Setelah user disimpan, Anda akan diarahkan ke halaman
                                                        pendaftaran Face ID. Pendaftaran dilakukan di perangkat milik user (atau perangkat
                                                        kasir yang akan dipakai) menggunakan biometrik bawaan perangkat.
                                                    </p>
                                                    {errors.enroll_face && <div className="text-danger small mt-2">{errors.enroll_face}</div>}
                                                </div>
                                            </div>

                                            {/* Roles */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <label className="fw-semibold">Hak Akses <span className="text-danger">*</span></label>
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
                                                <label className="form-label fw-semibold">Toko <span className="text-danger">*</span></label>
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
                                                onClick={handleReset}
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
                                                        <i className="bi bi-save me-2"></i>Simpan
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
