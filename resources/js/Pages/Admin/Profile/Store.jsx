import { useState } from "react"
import { usePage, Head, useForm } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function UpdateProfile() {
    const { store, warehouses, user } = usePage().props

    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

    const { data, setData, post, processing: storeProcessing, errors: storeErrors } = useForm({
        name: store?.name || "",
        address: store?.address || "",
    })

    const { data: passwordData, setData: setPasswordData, post: postPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        password: "",
        password_confirmation: "",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post("/admin/profile-store", {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Profil toko berhasil diperbarui",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                })
            },
            onError: () => {
                Swal.fire({
                    title: "Gagal!",
                    text: "Terjadi kesalahan saat menyimpan perubahan",
                    icon: "error",
                })
            }
        })
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        postPassword("/admin/update-password", {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Password berhasil diperbarui",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                })
                resetPassword()
            },
            onError: () => {
                Swal.fire({
                    title: "Gagal!",
                    text: "Gagal memperbarui password",
                    icon: "error",
                })
            }
        })
    }

    return (
        <>
            <Head>
                <title>Profil - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row justify-content-center mt-4">
                    <div className="col-md-10 col-lg-8">
                        {/* Card Profil Pengguna */}
                        <div className="card border-1">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                <h5 className="card-title fw-bold mb-0">
                                    <i className="bi bi-person-gear me-2"></i>Profil Pengguna
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-12 mb-2">
                                            <div className="form-floating">
                                                <input
                                                    type="email"
                                                    className="form-control-plaintext"
                                                    id="profileEmail"
                                                    value={user.email}
                                                    disabled
                                                    readOnly
                                                    style={{ background: "transparent" }}
                                                    tabIndex={-1}
                                                />
                                                <label htmlFor="profileEmail">Email</label>
                                            </div>
                                        </div>
                                        {user.role !== "admin" && store && (
                                            <>
                                                <div className="col-md-6">
                                                    <div className="form-floating mb-3">
                                                        <input
                                                            type="text"
                                                            className={`form-control rounded-0 ${storeErrors.name ? "is-invalid" : ""}`}
                                                            id="storeName"
                                                            placeholder="Nama Toko"
                                                            value={data.name}
                                                            onChange={(e) => setData("name", e.target.value)}
                                                        />
                                                        <label htmlFor="storeName">Nama Toko</label>
                                                        {storeErrors.name && (
                                                            <div className="invalid-feedback">{storeErrors.name}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-floating mb-3">
                                                        <textarea
                                                            className={`form-control rounded-0 ${storeErrors.address ? "is-invalid" : ""}`}
                                                            id="storeAddress"
                                                            style={{ minHeight: 80 }}
                                                            placeholder="Alamat Toko"
                                                            value={data.address}
                                                            onChange={(e) => setData("address", e.target.value)}
                                                        />
                                                        <label htmlFor="storeAddress">Alamat Toko</label>
                                                        {storeErrors.address && (
                                                            <div className="invalid-feedback">{storeErrors.address}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="d-flex justify-content-end border-top pt-3">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary"
                                                            disabled={storeProcessing}
                                                        >
                                                            {storeProcessing ? (
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
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Card Ubah Password */}
                        <div className="card border-1  mt-4">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                <h5 className="card-title fw-bold mb-0">
                                    <i className="bi bi-shield-lock me-2"></i>Ubah Password
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control rounded-0 ${passwordErrors.password ? "is-invalid" : ""}`}
                                                    id="newPassword"
                                                    placeholder="Password Baru"
                                                    value={passwordData.password}
                                                    onChange={(e) => setPasswordData("password", e.target.value)}
                                                />
                                                <label htmlFor="newPassword">Password Baru</label>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary position-absolute end-0 top-0 mt-2 me-2"
                                                    tabIndex={-1}
                                                    style={{ zIndex: 2 }}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                </button>
                                                {passwordErrors.password && (
                                                    <div className="invalid-feedback">{passwordErrors.password}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type={showPasswordConfirmation ? "text" : "password"}
                                                    className={`form-control rounded-0 ${passwordErrors.password_confirmation ? "is-invalid" : ""}`}
                                                    id="passwordConfirmation"
                                                    placeholder="Konfirmasi Password"
                                                    value={passwordData.password_confirmation}
                                                    onChange={(e) => setPasswordData("password_confirmation", e.target.value)}
                                                />
                                                <label htmlFor="passwordConfirmation">Konfirmasi Password</label>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary position-absolute end-0 top-0 mt-2 me-2"
                                                    tabIndex={-1}
                                                    style={{ zIndex: 2 }}
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                >
                                                    <i className={`bi ${showPasswordConfirmation ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                </button>
                                                {passwordErrors.password_confirmation && (
                                                    <div className="invalid-feedback">{passwordErrors.password_confirmation}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="d-flex justify-content-end border-top pt-3">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={passwordProcessing}
                                                >
                                                    {passwordProcessing ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-key me-2"></i>Simpan Password
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Daftar Warehouse */}
                        {store && warehouses.length > 0 && (
                            <div className="card border-0 shadow mt-4">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h3 className="card-title fw-bold mb-0">
                                        <i className="bi bi-house-gear me-2"></i>Daftar Gudang Terkait
                                    </h3>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {warehouses.map((warehouse) => (
                                            <div className="col-md-6 col-lg-6" key={warehouse.id}>
                                                <div className="card border shadow h-100">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center mb-3">
                                                            <div
                                                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                                                style={{ width: '40px', height: '40px' }}
                                                            >
                                                                <i className="bi bi-house-door fs-5"></i>
                                                            </div>
                                                            <h5 className="mb-0 ms-3">{warehouse.name}</h5>
                                                        </div>
                                                        <div className="mb-3">
                                                            <p className="text-muted mb-1">
                                                                <i className="bi bi-geo-alt me-2"></i>
                                                                {warehouse.address}
                                                            </p>
                                                            <small className="text-muted">
                                                                {warehouse.city?.name}, {warehouse.province?.name}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}
