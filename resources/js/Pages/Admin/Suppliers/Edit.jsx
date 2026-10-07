import { useState, useEffect, useCallback } from "react"
import { useForm, Head, usePage, Link } from '@inertiajs/react'
import Swal from 'sweetalert2'
import AdminLayout from "../../../Layouts/AdminLayout"

export default function SupplierEdit() {
    const { supplier, provinces } = usePage().props

    const [cities, setCities] = useState([])
    const [loadingCities, setLoadingCities] = useState(false)

    const { data, setData, put, processing, errors, reset } = useForm({
        name: supplier?.name || '',
        address: supplier?.address || '',
        phone: supplier?.phone || '',
        description: supplier?.description || '',
        status: supplier?.status || 'active',
        province_id: supplier?.province_id || '',
        city_id: supplier?.city_id || ''
    })

    // Helper untuk mengambil data kota berdasarkan provinceId
    const fetchCities = useCallback(async (provinceId) => {
        if (!provinceId) {
            setCities([])
            return
        }

        try {
            setLoadingCities(true)
            const response = await fetch(`/admin/get-cities/${provinceId}`)
            const citiesData = await response.json()
            setCities(citiesData)
        } catch (error) {
            console.error("Gagal memuat kota:", error)
        } finally {
            setLoadingCities(false)
        }
    }, [])

    // Handler ketika User mengubah dropdown Provinsi
    const handleProvinceChange = (e) => {
        const provinceId = e.target.value
        setData((prev) => ({
            ...prev,
            province_id: provinceId,
            city_id: '' // Reset pilihan kota HANYA saat user mengubah provinsi secara manual
        }))
        fetchCities(provinceId)
    }

    // Load daftar kota pertama kali tanpa mereset data.city_id
    useEffect(() => {
        if (supplier?.province_id) {
            fetchCities(supplier.province_id)
        }
    }, [supplier?.province_id, fetchCities])

    const handleReset = () => {
        reset() // Mengembalikan state useForm ke data initial (termasuk city_id asli)
        if (supplier?.province_id) {
            fetchCities(supplier.province_id)
        } else {
            setCities([])
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        put(`/admin/suppliers/${supplier.id}`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data supplier berhasil diperbarui',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        })
    }

    return (
        <>
            <Head>
                <title>Edit Supplier - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-truck me-2"></i>Edit Supplier
                                    </h5>
                                    <Link href="/admin/suppliers" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            {/* Nama & Telepon */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="supplierName"
                                                        className={`form-control rounded-0 ${errors.name ? 'is-invalid' : ''}`}
                                                        placeholder="Nama Supplier"
                                                        value={data.name}
                                                        onChange={e => setData('name', e.target.value)}
                                                    />
                                                    <label htmlFor="supplierName">Nama Supplier</label>
                                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="supplierPhone"
                                                        className={`form-control rounded-0 ${errors.phone ? 'is-invalid' : ''}`}
                                                        placeholder="Nomor Telepon"
                                                        value={data.phone}
                                                        onChange={e => setData('phone', e.target.value)}
                                                    />
                                                    <label htmlFor="supplierPhone">Nomor Telepon</label>
                                                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                                </div>
                                            </div>

                                            {/* Alamat */}
                                            <div className="col-12">
                                                <div className="form-floating mb-3">
                                                    <textarea
                                                        id="supplierAddress"
                                                        className={`form-control rounded-0 ${errors.address ? 'is-invalid' : ''}`}
                                                        placeholder="Alamat Lengkap"
                                                        style={{ minHeight: 80 }}
                                                        value={data.address}
                                                        onChange={e => setData('address', e.target.value)}
                                                    />
                                                    <label htmlFor="supplierAddress">Alamat Lengkap</label>
                                                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                                </div>
                                            </div>

                                            {/* Lokasi */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <h6 className="fw-semibold mb-3">Lokasi</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <div className="form-floating mb-3">
                                                                <select
                                                                    id="provinceSelect"
                                                                    className={`form-select rounded-0 ${errors.province_id ? 'is-invalid' : ''}`}
                                                                    value={data.province_id}
                                                                    onChange={handleProvinceChange}
                                                                >
                                                                    <option value="">Pilih Provinsi...</option>
                                                                    {provinces?.map((province) => (
                                                                        <option key={province.id} value={province.id}>
                                                                            {province.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <label htmlFor="provinceSelect">Provinsi</label>
                                                                {errors.province_id && <div className="invalid-feedback">{errors.province_id}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-floating mb-3">
                                                                <select
                                                                    id="citySelect"
                                                                    className={`form-select rounded-0 ${errors.city_id ? 'is-invalid' : ''}`}
                                                                    value={data.city_id}
                                                                    onChange={(e) => setData('city_id', e.target.value)}
                                                                    disabled={!data.province_id || loadingCities}
                                                                >
                                                                    <option value="">{loadingCities ? "Memuat..." : "Pilih Kota..."}</option>
                                                                    {cities.map((city) => (
                                                                        <option key={city.id} value={city.id}>
                                                                            {city.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <label htmlFor="citySelect">Kota/Kabupaten</label>
                                                                {errors.city_id && <div className="invalid-feedback">{errors.city_id}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Deskripsi */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <select
                                                        id="statusSelect"
                                                        className={`form-select rounded-0 ${errors.status ? 'is-invalid' : ''}`}
                                                        value={data.status}
                                                        onChange={e => setData('status', e.target.value)}
                                                    >
                                                        <option value="active">Aktif</option>
                                                        <option value="inactive">Nonaktif</option>
                                                    </select>
                                                    <label htmlFor="statusSelect">Status</label>
                                                    {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <textarea
                                                        id="supplierDesc"
                                                        className="form-control rounded-0"
                                                        placeholder="Deskripsi (opsional)"
                                                        style={{ minHeight: 80 }}
                                                        value={data.description || ''}
                                                        onChange={e => setData('description', e.target.value)}
                                                    />
                                                    <label htmlFor="supplierDesc">Deskripsi (opsional)</label>
                                                </div>
                                            </div>

                                            {/* Tombol Aksi */}
                                            <div className="col-12">
                                                <div className="d-flex justify-content-between border-top pt-4">
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
                                                                <i className="bi bi-save me-2"></i>Simpan Perubahan
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
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
