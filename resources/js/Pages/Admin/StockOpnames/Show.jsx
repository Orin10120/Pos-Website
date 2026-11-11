import { usePage, Head } from "@inertiajs/react"
import AdminLayout from "../../../Layouts/AdminLayout"

export default function StockOpnameDetail() {
    const { stockOpname, storeNames, storeProducts, warehouses, storeStockQuantities } = usePage().props

    return (
        <>
            <Head>
                <title>Stock Opname Detail - AlphaPOS</title>
            </Head>
            <AdminLayout>
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <h5 className="mb-3">
                                <i className="bi bi-clipboard me-2"></i>
                                Stock Opname Detail
                            </h5>
                            <div className="card shadow-sm border-0">
                                {/* Header */}
                                <div className="card-header bg-info bg-opacity-75 text-white d-flex justify-content-between align-items-center">
                                    <button
                                        onClick={() => window.history.back()}
                                        className="btn btn-outline-dark btn-md"
                                    >
                                        <i className="bi bi-arrow-left"></i> Back
                                    </button>
                                    <a
                                        href={`/admin/stock-opnames/${stockOpname.id}/export`}
                                        className="btn btn-outline-dark btn-md"
                                    >
                                        <i className="bi bi-file-earmark-excel-fill me-1"></i> Export Excel
                                    </a>
                                </div>

                                {/* Body */}
                                <div className="card-body p-4">
                                    {/* Stock Opname Information */}
                                    <div className="mb-4">
                                        <h5 className="fw-semibold mb-3">Informasi Stock Opname</h5>
                                        <div>
                                            <strong>Tanggal Opname:</strong> {stockOpname.opname_date}
                                        </div>
                                        <div>
                                            <strong>Status:</strong> {stockOpname.status}
                                        </div>
                                        <div>
                                            <strong>Toko:</strong> {storeNames[0]?.name || 'Toko Tidak Diketahui'}
                                        </div>
                                    </div>

                                    {/* Warehouse Information */}
                                    <div className="mb-4">
                                        <h5 className="fw-semibold mb-3">Informasi Gudang</h5>
                                        <div className="card border">
                                            <div className="card-body p-0">
                                                <div className="table-responsive p-4">
                                                    <table className="table align-middle table-hover">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th scope="col">Nama Gudang</th>
                                                                <th scope="col">Alamat Gudang</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {warehouses.length > 0 ? (
                                                                warehouses.map((warehouse) => (
                                                                    <tr key={warehouse.id}>
                                                                        <td>{warehouse.name}</td>
                                                                        <td>{warehouse.address}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="2" className="text-center">Tidak ada data gudang</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products Table */}
                                    <div className="mb-4">
                                        <h5 className="fw-semibold mb-3">Daftar Produk (Detail Stock Opname)</h5>
                                        <div className="card border">
                                            <div className="card-body p-0">
                                                <div className="table-responsive p-4">
                                                    <table className="table align-middle table-hover">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th scope="col" width="5%">No</th>
                                                                <th scope="col">Nama Produk</th>
                                                                <th scope="col">Kuantitas Stok (Awal)</th>
                                                                <th scope="col">Kuantitas Fisik</th>
                                                                <th scope="col">Selisih Kuantitas</th>
                                                                <th scope="col">Penjualan (Kuantitas)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {storeProducts.length > 0 ? (
                                                                storeProducts.map((product, index) => {
                                                                    const salesQuantity = product.sales_quantity || 0
                                                                    const quantityDifference = product.quantity_difference

                                                                    return (
                                                                        <tr key={product.product_id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{product.product.name}</td>
                                                                            <td>{product.stock_quantity}</td>
                                                                            <td>{product.physical_quantity || 0}</td>
                                                                            <td className={quantityDifference < 0 ? 'text-danger' : ''}>
                                                                                {quantityDifference}
                                                                            </td>
                                                                            <td>{salesQuantity}</td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="6" className="text-center">Tidak ada data produk</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Stock Quantities */}
                                    <div className="mb-4">
                                        <h5 className="fw-semibold mb-3">Total Stok Toko</h5>
                                        <div className="card border">
                                            <div className="card-body p-0">
                                                <div className="table-responsive p-4">
                                                    <table className="table align-middle table-hover">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th scope="col">Toko</th>
                                                                <th scope="col">Total Stok</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {storeStockQuantities.length > 0 ? (
                                                                storeStockQuantities.map((storeStock) => (
                                                                    <tr key={storeStock.store_id}>
                                                                        <td>{storeNames[0]?.name || 'Toko Tidak Diketahui'}</td>
                                                                        <td>{storeStock.total_stock}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="2" className="text-center">Tidak ada data stok toko</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            onClick={() => window.history.back()}
                                            className="btn btn-secondary"
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Kembali
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}
