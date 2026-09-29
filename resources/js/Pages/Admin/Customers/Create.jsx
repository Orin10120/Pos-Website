import { useForm, Head, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function CustomerCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        phone: "",
        address: "",
        email: "",
        gender: "pria",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post("/admin/customers", {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Pelanggan berhasil ditambahkan",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'rounded-4 shadow-sm'
                    }
                })
                reset()
            },
        })
    }

    return (
        <>
            <Head>
                <title>Tambah Pelanggan - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="container-fluid py-4">
                    {/* Container Wrapper khusus agar Form Pas di Tengah */}
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-10 col-xl-8 col-xxl-7">
                            
                            {/* Header Section */}
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark">Tambah Pelanggan Baru</h4>
                                    <p className="text-muted small mb-0">Isi formulir di bawah untuk menambahkan data pelanggan ke sistem.</p>
                                </div>
                                <Link 
                                    href="/admin/customers" 
                                    className="btn btn-light border-0 shadow-sm rounded-3 px-3 py-2 d-inline-flex align-items-center text-secondary fw-medium"
                                >
                                    <i className="bi bi-arrow-left me-2"></i> Kembali
                                </Link>
                            </div>

                            {/* Main Form Card */}
                            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                                <div className="card-body p-4 p-md-5">
                                    <form onSubmit={handleSubmit}>
                                        
                                        {/* Section: Informasi Pribadi */}
                                        <div className="mb-4 pb-2">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="badge bg-primary-subtle text-primary p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                    <i className="bi bi-person fs-6"></i>
                                                </div>
                                                <h6 className="fw-bold text-dark mb-0">Informasi Pribadi</h6>
                                            </div>

                                            <div className="row g-3">
                                                {/* Nama Lengkap */}
                                                <div className="col-md-7">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            id="namaLengkap"
                                                            className={`form-control border-1 rounded-3 ${errors.name ? 'is-invalid' : ''}`}
                                                            placeholder="Nama Lengkap"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                        />
                                                        <label htmlFor="namaLengkap">Nama Lengkap <span className="text-danger">*</span></label>
                                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                    </div>
                                                </div>

                                                {/* Jenis Kelamin */}
                                                <div className="col-md-5">
                                                    <label className="form-label text-muted small fw-medium mb-2 d-block">Jenis Kelamin</label>
                                                    <div className="d-flex gap-2">
                                                        <input 
                                                            type="radio" 
                                                            className="btn-check" 
                                                            name="gender" 
                                                            id="genderPria" 
                                                            value="pria" 
                                                            checked={data.gender === 'pria'} 
                                                            onChange={(e) => setData('gender', e.target.value)} 
                                                        />
                                                        <label className="btn btn-outline-light text-dark border flex-fill py-2 rounded-3 d-flex align-items-center justify-content-center gap-2" htmlFor="genderPria">
                                                            <i className="bi bi-gender-male text-primary"></i> Pria
                                                        </label>

                                                        <input 
                                                            type="radio" 
                                                            className="btn-check" 
                                                            name="gender" 
                                                            id="genderWanita" 
                                                            value="wanita" 
                                                            checked={data.gender === 'wanita'} 
                                                            onChange={(e) => setData('gender', e.target.value)} 
                                                        />
                                                        <label className="btn btn-outline-light text-dark border flex-fill py-2 rounded-3 d-flex align-items-center justify-content-center gap-2" htmlFor="genderWanita">
                                                            <i className="bi bi-gender-female text-danger"></i> Wanita
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4 text-border opacity-25" />

                                        {/* Section: Kontak */}
                                        <div className="mb-4 pb-2">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="badge bg-primary-subtle text-primary p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                    <i className="bi bi-telephone fs-6"></i>
                                                </div>
                                                <h6 className="fw-bold text-dark mb-0">Informasi Kontak</h6>
                                            </div>

                                            <div className="row g-3">
                                                {/* Nomor Telepon */}
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="text"
                                                            id="nomorTelepon"
                                                            className={`form-control border-1 rounded-3 ${errors.phone ? 'is-invalid' : ''}`}
                                                            placeholder="Nomor Telepon"
                                                            value={data.phone}
                                                            onChange={(e) => setData('phone', e.target.value)}
                                                        />
                                                        <label htmlFor="nomorTelepon">Nomor Telepon</label>
                                                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                                    </div>
                                                </div>

                                                {/* Email */}
                                                <div className="col-md-6">
                                                    <div className="form-floating">
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            className={`form-control border-1 rounded-3 ${errors.email ? 'is-invalid' : ''}`}
                                                            placeholder="Email (opsional)"
                                                            value={data.email}
                                                            onChange={(e) => setData('email', e.target.value)}
                                                        />
                                                        <label htmlFor="email">Email <span className="text-muted fw-normal">(Opsional)</span></label>
                                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4 text-border opacity-25" />

                                        {/* Section: Alamat */}
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="badge bg-primary-subtle text-primary p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                    <i className="bi bi-geo-alt fs-6"></i>
                                                </div>
                                                <h6 className="fw-bold text-dark mb-0">Alamat Lengkap</h6>
                                            </div>

                                            <div className="form-floating">
                                                <textarea
                                                    className={`form-control border-1 rounded-3 ${errors.address ? 'is-invalid' : ''}`}
                                                    id="alamat"
                                                    style={{ height: "110px" }}
                                                    placeholder="Alamat lengkap"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                ></textarea>
                                                <label htmlFor="alamat">Alamat <span className="text-muted fw-normal">(Opsional)</span></label>
                                                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex align-items-center justify-content-end gap-2 pt-3">
                                            <button
                                                type="button"
                                                className="btn btn-light text-muted px-4 py-2 rounded-3 fw-medium"
                                                onClick={() => reset()}
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-4 py-2 rounded-3 fw-medium shadow-sm d-inline-flex align-items-center gap-2"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-lg"></i> Simpan Data
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