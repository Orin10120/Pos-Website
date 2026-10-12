import { useForm, Head, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function CategoryCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post("/admin/categories", {
            onSuccess: () => {
                Swal.fire({
                    title: "Success!",
                    text: "Category created successfully!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                })
                reset()
            },
        })
    }

    return (
        <>
            <Head>
                <title>Tambah Kategori - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="row g-4 mt-4">
                    <div className="col-xxl-12">
                        <div className="card bg-transparent border rounded-3 mb-5">
                            <div className="card border-0">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h5 className="card-title fw-bold mb-0">
                                        <i className="bi bi-folder-plus me-2"></i>Tambah Kategori
                                    </h5>
                                    <Link href="/admin/categories" className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-arrow-left me-2"></i>Kembali
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        id="namaKategori"
                                                        className={`form-control rounded-0 ${errors.name ? "is-invalid" : ""}`}
                                                        placeholder="Nama Kategori *"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                    />
                                                    <label htmlFor="namaKategori">Nama Kategori <span className="text-danger">*</span></label>
                                                    {errors.name && (
                                                        <div className="invalid-feedback">{errors.name}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-floating mb-3">
                                                    <textarea
                                                        id="deskripsiKategori"
                                                        className={`form-control rounded-0 ${errors.description ? "is-invalid" : ""}`}
                                                        style={{ minHeight: "100px" }}
                                                        placeholder="Deskripsi (Opsional)"
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                    />
                                                    <label htmlFor="deskripsiKategori">Deskripsi (opsional)</label>
                                                    {errors.description && (
                                                        <div className="invalid-feedback">{errors.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="d-flex justify-content-between border-top pt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        onClick={() => reset()}
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
