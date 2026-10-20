import { useState, useRef } from "react"
import { Head, usePage, Link, router } from "@inertiajs/react"
import Swal from "sweetalert2"
import Barcode from "react-barcode"
import Pagination from "../../../Components/Pagination"
import AdminLayout from "../../../Layouts/AdminLayout"
import { formatRupiah } from "../../../utils/rupiah"
import hasAnyPermission from "../../../utils/hasAnyPermission"

export default function ProductIndex() {
    const { products } = usePage().props
    const [filterText, setFilterText] = useState("")

    const filteredProducts = products.data.filter(
        (product) =>
            product.name &&
            product.name.toLowerCase().includes(filterText.toLowerCase())
    )

    const barcodeRefs = useRef({})

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/products/${id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            "Deleted!",
                            "Produk has been deleted.",
                            "success"
                        )
                        window.location.reload()
                    },
                    onError: () => {
                        Swal.fire(
                            "Error!",
                            "There was a problem deleting the product.",
                            "error"
                        )
                    },
                })
            }
        })
    }


    const handleDownloadBarcode = (productId, barcodeValue) => {
        const svg = barcodeRefs.current[productId]
        if (svg) {
            const serializer = new XMLSerializer()
            const svgString = serializer.serializeToString(svg)
            const canvas = document.createElement("canvas")
            const img = new Image()
            const svgBlob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8",
            })
            const url = URL.createObjectURL(svgBlob)

            img.onload = () => {
                canvas.width = img.width * 2
                canvas.height = img.height * 2
                const context = canvas.getContext("2d")
                context.drawImage(img, 0, 0)
                URL.revokeObjectURL(url)
                const pngUrl = canvas.toDataURL("image/png")
                const downloadLink = document.createElement("a")
                downloadLink.href = pngUrl
                downloadLink.download = `barcode-${barcodeValue}.png`
                document.body.appendChild(downloadLink)
                downloadLink.click()
                document.body.removeChild(downloadLink)
            }

            img.src = url
        }
    }

    return (
        <>
            <Head>
                <title>Products - AlphaPOS</title>
            </Head>
            <AdminLayout>
                {/* Navigasi Breadcrumb */}
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link href="/admin">Dashboard</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                            Products
                        </li>
                    </ol>
                </nav>

                {/* Judul Halaman */}
                <div className="row mb-3">
                    <div className="col-md-12">
                        <h3 className="font-weight-bold">
                            <i className="bi bi-box-seam-fill"></i> Products
                        </h3>
                    </div>
                </div>

                {/* Pencarian dan Tombol Tambah Produk */}
                <div className="row mb-3">
                    <div className="col-md-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <input
                                type="text"
                                className="form-control me-2 w-25"
                                placeholder="Cari berdasarkan Nama"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                            {hasAnyPermission(["products.create"]) && (
                                <Link
                                    href="/admin/products/create"
                                    className="btn btn-success"
                                >
                                    <i className="bi bi-plus-circle-fill me-2"></i>{" "}
                                    Tambah Produk
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabel Produk dengan Scroll Horizontal */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border">
                            <div className="card-body p-0">
                                <div
                                    className="table-responsive"
                                    style={{ overflowX: "auto" }}
                                >
                                    <table className="table align-middle table-hover">
                                        <thead className="bg-light text-white">
                                            <tr>
                                                <th className="text-center">
                                                    No.
                                                </th>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Barcode</th>
                                                <th>Category</th>
                                                <th>Purchase Price</th>
                                                <th>Selling Price</th>
                                                <th>Stock</th>
                                                <th className="text-center">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map(
                                                    (product, index) => (
                                                        <tr key={product.id}>
                                                            <td className="text-center">
                                                                {index +
                                                                    1 +
                                                                    (products.current_page -
                                                                        1) *
                                                                    products.per_page}
                                                            </td>
                                                            <td>
                                                                <img
                                                                    src={
                                                                        product.image
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    width="50"
                                                                />
                                                            </td>
                                                            <td>
                                                                {product.name ||
                                                                    "-"}
                                                            </td>
                                                            <td className="text-center">
                                                                {/* Meningkatkan ukuran barcode */}
                                                                <svg
                                                                    ref={(el) =>
                                                                    (barcodeRefs.current[
                                                                        product.id
                                                                    ] = el)
                                                                    }
                                                                >
                                                                    <Barcode
                                                                        value={
                                                                            product.barcode
                                                                        }
                                                                        width={
                                                                            2
                                                                        }
                                                                        height={
                                                                            90
                                                                        }
                                                                        fontSize={
                                                                            16
                                                                        }
                                                                        displayValue={
                                                                            true
                                                                        }
                                                                        renderer="svg"
                                                                        textAlign="center"
                                                                        margin={10}
                                                                    />
                                                                </svg>
                                                            </td>

                                                            <td>
                                                                {product
                                                                    .category
                                                                    .name ||
                                                                    "Tidak ada kategori"}
                                                            </td>
                                                            <td>
                                                                {formatRupiah(
                                                                    product.purchase_price
                                                                )}
                                                            </td>
                                                            <td>
                                                                {formatRupiah(
                                                                    product.selling_price
                                                                )}
                                                            </td>
                                                            <td>
                                                                {product.stock_total
                                                                    ? product
                                                                        .stock_total
                                                                        .total_stock
                                                                    : 0}
                                                            </td>
                                                            <td className="text-center">
                                                                {hasAnyPermission(["products.edit"]) && (
                                                                    <Link
                                                                        href={`/admin/products/${product.id}/edit`}
                                                                        className="btn btn-outline-primary btn-sm me-2 rounded"
                                                                        aria-label={`Edit product: ${product.name}`}
                                                                    >
                                                                        <i className="bi bi-pencil-fill"></i>{" "}
                                                                        Edit
                                                                    </Link>
                                                                )}
                                                                {hasAnyPermission(["products.delete"]) && (
                                                                    <>

                                                                        <button
                                                                            className="btn btn-outline-danger btn-sm rounded me-2"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    product.id
                                                                                )
                                                                            }
                                                                            aria-label={`Delete product: ${product.name}`}
                                                                        >
                                                                            <i className="bi bi-trash-fill"></i>{" "}
                                                                            Delete
                                                                        </button>

                                                                        <button
                                                                            className="btn btn-outline-secondary btn-sm rounded"
                                                                            onClick={() =>
                                                                                handleDownloadBarcode(
                                                                                    product.id,
                                                                                    product.barcode
                                                                                )
                                                                            }
                                                                            aria-label={`Download barcode untuk produk: ${product.name}`}
                                                                        >
                                                                            <i className="bi bi-download"></i>{" "}
                                                                            Download
                                                                            Barcode
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="9"
                                                        className="text-center"
                                                    >
                                                        Tidak ada produk
                                                        ditemukan
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Komponen Pagination */}
                                <Pagination links={products.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}
