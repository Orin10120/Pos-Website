import { useState } from "react"
import { useForm, Head, usePage, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"
import Select from "react-select"

export default function StoreEdit() {
    const { provinces, warehouses, store, cities: initialCities } = usePage().props

    const [cities, setCities] = useState(initialCities)
    const [loadingCities, setLoadingCities] = useState(false)

    const { data, setData, put, processing, errors } = useForm({
        name: store.name,
        address: store.address,
        province_id: store.province_id,
        city_id: store.city_id,
        warehouse_ids: store.warehouses.map(wh => wh.id),
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

    const handleReset = () => {
        setData({
            name: store.name,
            address: store.address,
            province_id: store.province_id,
            city_id: store.city_id,
            warehouse_ids: store.warehouses.map(wh => wh.id)
        })
        setCities(initialCities)
    }

    const updateStore = async (e) => {
        e.preventDefault()
        put(`/admin/stores/${store.id}`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data Store berhasil diperbarui',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                })
            },
        })
    }

    const warehouseOptions = warehouses.map(warehouse => ({
        value: warehouse.id,
        label: warehouse.name
    }))

    return (
        <>
            <Head>
                <title>Edit Toko - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-shop me-2"></i>Edit Toko
                                    </h5>
                                    <Link href="/admin/stores" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={updateStore}>
                                        <div className="row g-3">
                                            {/* Nama dan Alamat */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="storeName"
                                                        className={`form-control rounded-0 ${errors.name ? 'is-invalid' : ''}`}
                                                        placeholder="Nama Toko"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                    />
                                                    <label htmlFor="storeName">Nama Toko</label>
                                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="storeAddress"
                                                        className={`form-control rounded-0 ${errors.address ? 'is-invalid' : ''}`}
                                                        placeholder="Alamat Lengkap"
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                    />
                                                    <label htmlFor="storeAddress">Alamat Lengkap</label>
                                                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                                </div>
                                            </div>

                                            {/* Lokasi */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <h6 className="fw-semibold mb-3">Lokasi Toko</h6>
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
                                                                <label htmlFor="provinceSelect">Provinsi</label>
                                                                {errors.province_id && <div className="invalid-feedback">{errors.province_id}</div>}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-floating mb-3">
                                                                <select
                                                                    className={`form-select rounded-0 ${errors.city_id ? 'is-invalid' : ''}`}
                                                                    id="citySelect"
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

                                            {/* Gudang */}
                                            <div className="col-12">
                                                <div className="border rounded p-3 bg-light">
                                                    <label className="fw-semibold mb-2">Gudang Terkait</label>
                                                    <Select
                                                        isMulti
                                                        options={warehouseOptions}
                                                        value={data.warehouse_ids.map(id =>
                                                            warehouseOptions.find(opt => opt.value === id)
                                                        )}
                                                        onChange={(selected) =>
                                                            setData('warehouse_ids', selected.map(item => item.value))
                                                        }
                                                        classNamePrefix="react-select"
                                                        className={`react-select-container ${errors.warehouse_ids ? 'is-invalid' : ''}`}
                                                    />
                                                    {errors.warehouse_ids &&
                                                        <div className="text-danger small mt-2">{errors.warehouse_ids}</div>}
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
