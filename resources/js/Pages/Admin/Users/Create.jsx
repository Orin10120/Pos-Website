import { useState, useRef } from "react"
import { usePage, useForm, Head, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"
import Webcam from "react-webcam"

export default function UserCreate() {
    const { roles, stores } = usePage().props

    const webcamRef = useRef(null)
    const [useCamera, setUseCamera] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        roles: "",
        face_image: null,
        store_id: "",
    })

    const handleCapture = async () => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            try {
                const res = await fetch(imageSrc)
                const blob = await res.blob()
                const file = new File([blob], "captured-face.jpg", { type: "image/jpeg" })

                setData("face_image", file)
                setPreviewImage(imageSrc)
                setUseCamera(false) // Otomatis tutup kamera setelah foto diambil
            } catch (error) {
                console.error("Gagal mengambil gambar dari webcam:", error)
            }
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setData("face_image", file)
            const reader = new FileReader()
            reader.onload = (event) => setPreviewImage(event.target.result)
            reader.readAsDataURL(file)
        }
    }

    const handleReset = () => {
        reset()
        setPreviewImage(null)
        setUseCamera(false)
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

                                            {/* Face Recognition */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <label className="fw-semibold mb-3 d-block">Foto Wajah (Face Recognition)</label>

                                                    {!useCamera ? (
                                                        <div className="d-flex flex-column gap-2">
                                                            <input
                                                                type="file"
                                                                className={`form-control ${errors.face_image ? "is-invalid" : ""}`}
                                                                onChange={handleImageUpload}
                                                                accept="image/*"
                                                            />
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-secondary btn-sm mt-1"
                                                                    onClick={() => setUseCamera(true)}
                                                                >
                                                                    <i className="bi bi-camera me-2"></i>Gunakan Kamera Direct
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-start">
                                                            <Webcam
                                                                audio={false}
                                                                ref={webcamRef}
                                                                screenshotFormat="image/jpeg"
                                                                className="img-fluid rounded mb-2 border"
                                                                videoConstraints={{ width: 400, height: 300, facingMode: "user" }}
                                                            />
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={handleCapture}
                                                                >
                                                                    <i className="bi bi-camera-fill me-2"></i>Ambil Foto
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => setUseCamera(false)}
                                                                >
                                                                    <i className="bi bi-x-circle me-2"></i>Batal
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {previewImage && (
                                                        <div className="mt-3">
                                                            <p className="small text-muted mb-2">Pratinjau Foto Wajah Terpilih:</p>
                                                            <img
                                                                src={previewImage}
                                                                alt="Preview Wajah"
                                                                className="img-thumbnail rounded"
                                                                style={{ maxWidth: "180px", maxHeight: "180px", objectFit: "cover" }}
                                                            />
                                                        </div>
                                                    )}

                                                    {errors.face_image && <div className="text-danger small mt-2">{errors.face_image}</div>}
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
