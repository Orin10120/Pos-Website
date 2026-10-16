import { useForm, Head, usePage, Link } from '@inertiajs/react'
import Swal from 'sweetalert2'
import AdminLayout from "../../../Layouts/AdminLayout"

export default function UnitEdit() {
    const { unit } = usePage().props

    const { data, setData, put, processing, errors } = useForm({
        name: unit.name || '',
    })

    const updateUnit = (e) => {
        e.preventDefault()
        put(`/admin/units/${unit.id}`, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Unit updated successfully!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                })
            },
        })
    }

    return (
        <>
            <Head>
                <title>Edit Satuan - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-tag-fill me-2"></i>Edit Satuan
                                    </h5>
                                    <Link href="/admin/units" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={updateUnit}>
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="editNamaSatuan"
                                                        className={`form-control rounded-0 ${errors.name ? "is-invalid" : ""}`}
                                                        placeholder="Nama Satuan"
                                                        value={data.name}
                                                        onChange={e => setData('name', e.target.value)}
                                                    />
                                                    <label htmlFor="editNamaSatuan">Nama Satuan</label>
                                                    {errors.name && (
                                                        <div className="invalid-feedback">{errors.name}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="d-flex justify-content-end border-top pt-4">
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
