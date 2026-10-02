import { useState } from "react"
import { useForm, Head, usePage, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function WarehouseCreate() {
    const { provinces } = usePage().props

    const [cities, setCities] = useState([])
    const [loadingCities, setLoadingCities] = useState(false)

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        address: '',
        province_id: '',
        city_id: '',
    })

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value
        setData("province_id", provinceId)
        setData("city_id", "")

        if (provinceId) {
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
        } else {
            setCities([])
        }
    }

    const createWarehouse = async (e) => {
        e.preventDefault()
        post('/admin/warehouses', {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Gudang berhasil dibuat',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                })
                reset()
            },
        })
    }

    return (
        <>
            <Head>
                <title>Tambah Gudang - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-house-gear me-2"></i>Tambah Gudang Baru
                                    </h5>
                                    <Link href="/admin/warehouses" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={createWarehouse}>
                                        <div className="row g-3">
                                            {/* Nama dan Alamat */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="warehouseName"
                                                        className={`form-control rounded-0 ${errors.name ? 'is-invalid' : ''}`}
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        placeholder="Nama Gudang *"
                                                    />
                                                    <label htmlFor="warehouseName">Nama Gudang <span className="text-danger">*</span></label>
                                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="warehouseAddress"
                                                        className={`form-control rounded-0 ${errors.address ? 'is-invalid' : ''}`}
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        placeholder="Alamat Lengkap *"
                                                    />
                                                    <label htmlFor="warehouseAddress">Alamat Lengkap <span className="text-danger">*</span></label>
                                                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                                </div>
                                            </div>

                                            {/* Lokasi */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <h6 className="fw-semibold mb-3">Lokasi Gudang</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <div className="form-floating mb-3">
                                                                <select
                                                                    className={`form-select rounded-0 ${errors.province_id ? 'is-invalid' : ''}`}
                                                                    id="provinceSelect"
                                                                    value={data.province_id}
                                                                    onChange={handleProvinceChange}
                                                                >
                                                                    <option value="">Pilih Provinsi...</option>
                                                                    {provinces.map((province) => (
                                                                        <option key={province.id} value={province.id}>
                                                                            {province.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <label htmlFor="provinceSelect">Provinsi <span className="text-danger">*</span></label>
                                                                {errors.province_id && <div className="invalid-feedback">{errors.province_id}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-floating mb-3">
                                                                <select
                                                                    className={`form-select rounded-0 ${errors.city_id ? 'is-invalid' : ''}`}
                                                                    id="citySelect"
                                                                    value={data.city_id}
                                                                    onChange={e => setData('city_id', e.target.value)}
                                                                    disabled={!data.province_id || loadingCities}
                                                                >
                                                                    <option value="">{loadingCities ? "Memuat..." : "Pilih Kota..."}</option>
                                                                    {cities.map((city) => (
                                                                        <option key={city.id} value={city.id}>
                                                                            {city.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <label htmlFor="citySelect">Kota/Kabupaten <span className="text-danger">*</span></label>
                                                                {errors.city_id && <div className="invalid-feedback">{errors.city_id}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tombol Aksi */}
                                            <div className="col-12">
                                                <div className="d-flex justify-content-between border-top pt-4">
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
                                                                <i className="bi bi-save me-2"></i>Simpan Gudang
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
