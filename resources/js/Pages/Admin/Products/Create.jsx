import { useState } from 'react'
import { useForm, usePage, Head, Link } from '@inertiajs/react'
import Swal from 'sweetalert2'
import AdminLayout from "../../../Layouts/AdminLayout"

export default function ProductCreate() {
    const { categories, units } = usePage().props
    const [previewImage, setPreviewImage] = useState(null)

    const { data, setData, post, processing, reset, errors } = useForm({
        barcode: '',
        name: '',
        category_id: '',
        unit_id: '',
        selling_price: '',
        purchase_price: '',
        image: null
    })

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setData('image', file)
            const reader = new FileReader()
            reader.onload = (e) => setPreviewImage(e.target.result)
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setData('image', null)
        setPreviewImage(null)
    }

    const createProduct = async (e) => {
        e.preventDefault()
        post('/admin/products', {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Produk berhasil dibuat',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                })
                reset()
                setPreviewImage(null)
            }
        })
    }

    return (
        <>
            <Head>
                <title>Tambah Produk - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-box-seam me-2"></i>Tambah Produk
                                    </h5>
                                    <Link href="/admin/products" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={createProduct} encType="multipart/form-data">
                                        <div className="row g-3">
                                            {/* Gambar Produk */}
                                            <div className="col-md-6">
                                                <div className="border rounded p-3 bg-light">
                                                    <label className="fw-semibold mb-2">Gambar Produk</label>
                                                    <div>
                                                        {previewImage && (
                                                            <div className="mb-3">
                                                                <img
                                                                    src={previewImage}
                                                                    alt="Preview"
                                                                    className="img-thumbnail"
                                                                    style={{ maxWidth: '200px' }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm mt-2"
                                                                    onClick={handleRemoveImage}
                                                                >
                                                                    <i className="bi bi-trash me-2"></i>Hapus Gambar
                                                                </button>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                                                            onChange={handleImageChange}
                                                            accept="image/*"
                                                        />
                                                        {errors.image && (
                                                            <div className="invalid-feedback">{errors.image}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Produk */}
                                            <div className="col-md-6">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="barcode"
                                                        className={`form-control rounded-0 ${errors.barcode ? 'is-invalid' : ''}`}
                                                        placeholder="Barcode *"
                                                        value={data.barcode}
                                                        onChange={e => setData('barcode', e.target.value)}
                                                    />
                                                    <label htmlFor="barcode">Barcode <span className="text-danger">*</span></label>
                                                    {errors.barcode && (
                                                        <div className="invalid-feedback">{errors.barcode}</div>
                                                    )}
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="productName"
                                                        className={`form-control rounded-0 ${errors.name ? 'is-invalid' : ''}`}
                                                        placeholder="Nama Produk *"
                                                        value={data.name}
                                                        onChange={e => setData('name', e.target.value)}
                                                    />
                                                    <label htmlFor="productName">Nama Produk <span className="text-danger">*</span></label>
                                                    {errors.name && (
                                                        <div className="invalid-feedback">{errors.name}</div>
                                                    )}
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <select
                                                        id="kategori"
                                                        className={`form-select rounded-0 ${errors.category_id ? 'is-invalid' : ''}`}
                                                        value={data.category_id}
                                                        onChange={e => setData('category_id', e.target.value)}
                                                    >
                                                        <option value="">Pilih Kategori...</option>
                                                        {categories.map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label htmlFor="kategori">Kategori <span className="text-danger">*</span></label>
                                                    {errors.category_id && (
                                                        <div className="invalid-feedback">{errors.category_id}</div>
                                                    )}
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <select
                                                        id="satuan"
                                                        className={`form-select rounded-0 ${errors.unit_id ? 'is-invalid' : ''}`}
                                                        value={data.unit_id}
                                                        onChange={e => setData('unit_id', e.target.value)}
                                                    >
                                                        <option value="">Pilih Satuan...</option>
                                                        {units.map(unit => (
                                                            <option key={unit.id} value={unit.id}>
                                                                {unit.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label htmlFor="satuan">Satuan <span className="text-danger">*</span></label>
                                                    {errors.unit_id && (
                                                        <div className="invalid-feedback">{errors.unit_id}</div>
                                                    )}
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="number"
                                                        id="hargaBeli"
                                                        className={`form-control rounded-0 ${errors.purchase_price ? 'is-invalid' : ''}`}
                                                        placeholder="Harga Beli *"
                                                        value={data.purchase_price}
                                                        onChange={e => setData('purchase_price', e.target.value)}
                                                    />
                                                    <label htmlFor="hargaBeli">Harga Beli <span className="text-danger">*</span></label>
                                                    {errors.purchase_price && (
                                                        <div className="invalid-feedback">{errors.purchase_price}</div>
                                                    )}
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="number"
                                                        id="hargaJual"
                                                        className={`form-control rounded-0 ${errors.selling_price ? 'is-invalid' : ''}`}
                                                        placeholder="Harga Jual *"
                                                        value={data.selling_price}
                                                        onChange={e => setData('selling_price', e.target.value)}
                                                    />
                                                    <label htmlFor="hargaJual">Harga Jual <span className="text-danger">*</span></label>
                                                    {errors.selling_price && (
                                                        <div className="invalid-feedback">{errors.selling_price}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tombol Aksi */}
                                        <div className="d-flex justify-content-between border-top mt-4 pt-4">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => { reset(); setPreviewImage(null) }}
                                                disabled={processing}
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
