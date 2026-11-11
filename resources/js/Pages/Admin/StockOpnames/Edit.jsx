import { useForm, usePage, Head } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function StockOpnameEdit() {
    const { stockOpname, products } = usePage().props

    const { data, setData, put, processing, errors } = useForm({
        opname_date: stockOpname.opname_date,
        status: stockOpname.status,
        products: stockOpname.details.map((detail) => ({
            product_id: detail.product.id,
            physical_quantity: detail.physical_quantity,
        })),
    })

    // Handle form submission
    const updateStockOpname = async (e) => {
        e.preventDefault()
        put(`/admin/stock-opnames/${stockOpname.id}`, {
            onSuccess: () => {
                Swal.fire({
                    title: "Success!",
                    text: "Stock opname updated successfully!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                })
            },
        })
    }

    // Handle general input change
    const handleChange = (e) => {
        setData(e.target.name, e.target.value)
    }

    // Handle product-specific input change
    const handleProductChange = (index, value) => {
        const updatedProducts = [...data.products]
        updatedProducts[index].physical_quantity = value
        setData("products", updatedProducts)
    }

    // Handle back navigation
    const handleBack = () => {
        window.history.back()
    }

    return (
        <>
            <Head>
                <title>Edit Stock Opname - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <h5 className="mb-3">
                                <i className="bi bi-clipboard me-2"></i>
                                Edit Stock Opname
                            </h5>
                            <div className="card shadow-sm border-0">
                                {/* Header */}
                                <div className="card-header bg-info bg-opacity-75 text-white d-flex justify-content-between align-items-center">
                                    <button
                                        onClick={handleBack}
                                        className="btn btn-outline-dark btn-md"
                                    >
                                        <i className="bi bi-arrow-left"></i> Back
                                    </button>
                                    <span></span> {/* Placeholder for alignment */}
                                </div>

                                {/* Body */}
                                <div className="card-body p-4">
                                    <form onSubmit={updateStockOpname}>
                                        {/* Input Tanggal */}
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Opname Date
                                                </label>
                                                <input
                                                    type="date"
                                                    name="opname_date"
                                                    className={`form-control ${errors.opname_date ? "is-invalid" : ""
                                                        }`}
                                                    value={data.opname_date}
                                                    onChange={handleChange}
                                                />
                                                {errors.opname_date && (
                                                    <div className="invalid-feedback">
                                                        {errors.opname_date}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Error Umum untuk Products */}
                                        {errors.products && (
                                            <div className="alert alert-danger mb-4">
                                                {Array.isArray(errors.products)
                                                    ? errors.products.join(", ")
                                                    : errors.products}
                                            </div>
                                        )}

                                        {/* Tabel Produk */}
                                        <div className="mb-4">
                                            <h5 className="fw-semibold mb-3">Product List</h5>
                                            <div className="card border">
                                                <div className="card-body p-0">
                                                    <div className="table-responsive p-4">
                                                        <table className="table align-middle table-hover">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th scope="col" width="5%">
                                                                        No
                                                                    </th>
                                                                    <th scope="col">Product Name</th>
                                                                    <th scope="col" width="20%">
                                                                        Physical Quantity
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {data.products.map((item, index) => (
                                                                    <tr key={item.product_id}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{products[index].name}</td>
                                                                        <td>
                                                                            <input
                                                                                type="number"
                                                                                className={`form-control ${errors[
                                                                                    `products.${index}.physical_quantity`
                                                                                ]
                                                                                    ? "is-invalid"
                                                                                    : ""
                                                                                    }`}
                                                                                value={item.physical_quantity}
                                                                                onChange={(e) =>
                                                                                    handleProductChange(
                                                                                        index,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                min="0"
                                                                            />

                                                                            {errors[
                                                                                `products.${index}.physical_quantity`
                                                                            ] && (
                                                                                    <div className="invalid-feedback">
                                                                                        {
                                                                                            errors[
                                                                                            `products.${index}.physical_quantity`
                                                                                            ]
                                                                                        }
                                                                                    </div>
                                                                                )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tombol */}
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        ></span>
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-save me-2"></i>
                                                        Simpan
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
