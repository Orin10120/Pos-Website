import { Head, useForm, Link, usePage } from '@inertiajs/react'
import Swal from 'sweetalert2'
import AdminLayout from "../../../Layouts/AdminLayout"

export default function CustomerEdit() {
    const { customer } = usePage().props

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        email: customer.email || '',
        gender: customer.gender || 'pria',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        put(`/admin/customers/${customer.id}`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data pelanggan berhasil diperbarui',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'rounded-4 shadow-lg border-0'
                    }
                })
            },
        })
    }

    return (
        <>
            <Head>
                <title>Edit Pelanggan - EasyPOS</title>
            </Head>
            <AdminLayout>
                <div className="container-fluid px-0 py-3">
                    <div className="row justify-content-center">
                        <div className="col-12 col-xl-10 col-xxl-8">
                            
                            {/* Header Section */}
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark">Edit Pelanggan</h4>
                                    <p className="text-muted small mb-0">Perbarui informasi profil dan kontak pelanggan</p>
                                </div>
                                <Link 
                                    href="/admin/customers" 
                                    className="btn btn-light btn-sm px-3 rounded-pill border-0 shadow-sm d-inline-flex align-items-center gap-2 fw-medium transition-all"
                                >
                                    <i className="bi bi-arrow-left"></i>
                                    <span>Kembali</span>
                                </Link>
                            </div>

                            {/* Main Form Card */}
                            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                                <div className="card-body p-4 p-md-5">
                                    <form onSubmit={handleSubmit} noValidate>
                                        
                                        {/* Section: Informasi Pribadi */}
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                                    <i className="bi bi-person fs-5"></i>
                                                </div>
                                                <h6 className="fw-bold text-dark mb-0">Informasi Pribadi</h6>
                                            </div>

                                            <div className="row g-3">
                                                {/* Nama Lengkap */}
                                                <div className="col-md-6">
                                                    <label htmlFor="name" className="form-label small fw-semibold text-secondary">
                                                        Nama Lengkap <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-0 text-muted rounded-start-3">
                                                            <i className="bi bi-person"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            className={`form-control bg-light border-0 rounded-end-3 py-2 ${errors.name ? 'is-invalid' : ''}`}
                                                            placeholder="Masukkan nama lengkap"
                                                            value={data.name}
                                                            onChange={e => setData('name', e.target.value)}
                                                        />
                                                    </div>
                                                    {errors.name && <div className="invalid-feedback d-block small mt-1">{errors.name}</div>}
                                                </div>

                                                {/* Jenis Kelamin (Modern Segmented Pill Selector) */}
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-semibold text-secondary">Jenis Kelamin</label>
                                                    <div className="d-flex p-1 bg-light rounded-3">
                                                        <button
                                                            type="button"
                                                            className={`btn border-0 flex-fill rounded-2 py-2 text-sm fw-medium transition-all ${data.gender === 'pria' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                                                            onClick={() => setData('gender', 'pria')}
                                                        >
                                                            <i className="bi bi-gender-male me-2"></i>Pria
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`btn border-0 flex-fill rounded-2 py-2 text-sm fw-medium transition-all ${data.gender === 'wanita' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                                                            onClick={() => setData('gender', 'wanita')}
                                                        >
                                                            <i className="bi bi-gender-female me-2"></i>Wanita
                                                        </button>
                                                    </div>
                                                    {errors.gender && <div className="invalid-feedback d-block small mt-1">{errors.gender}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4 border-light-subtle" />

                                        {/* Section: Informasi Kontak */}
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <div className="rounded-circle bg-info-subtle text-info p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                                    <i className="bi bi-telephone fs-5"></i>
                                                </div>
                                                <h6 className="fw-bold text-dark mb-0">Kontak & Akses</h6>
                                            </div>

                                            <div className="row g-3">
                                                {/* Nomor Telepon */}
                                                <div className="col-md-6">
                                                    <label htmlFor="phone" className="form-label small fw-semibold text-secondary">
                                                        Nomor Telepon <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-0 text-muted rounded-start-3">
                                                            <i className="bi bi-telephone"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            id="phone"
                                                            className={`form-control bg-light border-0 rounded-end-3 py-2 ${errors.phone ? 'is-invalid' : ''}`}
                                                            placeholder="Contoh: 08123456789"
                                                            value={data.phone}
                                                            onChange={e => setData('phone', e.target.value)}
                                                        />
                                                    </div>
                                                    {errors.phone && <div className="invalid-feedback d-block small mt-1">{errors.phone}</div>}
                                                </div>

                                                {/* Email */}
                                                <div className="col-md-6">
                                                    <label htmlFor="email" className="form-label small fw-semibold text-secondary">
                                                        Email <span className="text-muted font-normal">(Opsional)</span>
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-0 text-muted rounded-start-3">
                                                            <i className="bi bi-envelope"></i>
                                                        </span>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            className={`form-control bg-light border-0 rounded-end-3 py-2 ${errors.email ? 'is-invalid' : ''}`}
                                                            placeholder="nama@email.com"
                                                            value={data.email}
                                                            onChange={e => setData('email', e.target.value)}
                                                        />
                                                    </div>
                                                    {errors.email && <div className="invalid-feedback d-block small mt-1">{errors.email}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4 border-light-subtle" />

                                        {/* Section: Alamat */}
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <div className="rounded-circle bg-warning-subtle text-warning p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                                    <i className="bi bi-geo-alt fs-5"></i>
                                                </div>
                                                <h6 className="fw-bold text-dark mb-0">Alamat Lengkap</h6>
                                            </div>

                                            <div>
                                                <textarea
                                                    id="address"
                                                    className={`form-control bg-light border-0 rounded-3 p-3 ${errors.address ? 'is-invalid' : ''}`}
                                                    rows="3"
                                                    placeholder="Tuliskan alamat domisili atau jalan lengkap..."
                                                    value={data.address}
                                                    onChange={e => setData('address', e.target.value)}
                                                ></textarea>
                                                {errors.address && <div className="invalid-feedback d-block small mt-1">{errors.address}</div>}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
                                            <Link 
                                                href="/admin/customers" 
                                                className="btn btn-light px-4 py-2 rounded-3 fw-medium text-muted"
                                            >
                                                Batal
                                            </Link>
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-4 py-2 rounded-3 fw-medium shadow-sm d-inline-flex align-items-center gap-2 transition-all"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        <span>Menyimpan...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check2"></i>
                                                        <span>Simpan Perubahan</span>
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