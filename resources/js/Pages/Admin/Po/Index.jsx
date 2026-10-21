import { useState } from "react"
import { Head, Link, usePage, router } from "@inertiajs/react"
import Swal from "sweetalert2"
import AdminLayout from "../../../Layouts/AdminLayout"
import Pagination from "../../../Components/Pagination"
import { formatRupiah } from "../../../utils/rupiah"
import hasAnyPermission from "../../../utils/hasAnyPermission"

export default function PurchaseOrderIndex() {
    const { purchaseOrders } = usePage().props
    const [filterText, setFilterText] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [selectedPO, setSelectedPO] = useState(null)
    const [status, setStatus] = useState("")

    const filteredOrders = purchaseOrders.data.filter((order) =>
        order.po_number.toLowerCase().includes(filterText.toLowerCase())
    )

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the purchase order.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/po/${id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            "Deleted!",
                            "Purchase Order has been deleted.",
                            "success"
                        )
                        window.location.reload()
                    },
                    onError: () => {
                        Swal.fire(
                            "Error!",
                            "Failed to delete the purchase order.",
                            "error"
                        )
                    },
                })
            }
        })
    }

    const handleEdit = (order) => {
        setSelectedPO(order)
        setStatus(order.status)
        setShowModal(true)
    }

    const handleUpdateStatus = () => {
        router.put(
            `/admin/po/${selectedPO.id}`,
            { status: status },
            {
                onSuccess: () => {
                    setShowModal(false)
                    Swal.fire(
                        "Updated!",
                        "Purchase Order status has been updated.",
                        "success"
                    )
                    window.location.reload()
                },
                onError: (errors) => {
                    Swal.fire(
                        "Error!",
                        "Failed to update status.",
                        "error"
                    )
                },
            }
        )
    }

    return (
        <>
            <Head>
                <title>Purchase Orders - Admin</title>
            </Head>
            <AdminLayout>
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link href="/admin">Dashboard</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Purchase Orders
                        </li>
                    </ol>
                </nav>

                {/* Page Header */}
                <div className="row mb-3">
                    <div className="col-md-12">
                        <h3 className="font-weight-bold">
                            <i className="bi bi-file-text-fill"></i> Purchase Orders
                        </h3>
                    </div>
                </div>

                {/* Search and Add Button */}
                <div className="row mb-3">
                    <div className="col-md-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <input
                                type="text"
                                className="form-control me-2 w-25"
                                placeholder="Search by PO Number"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                            {hasAnyPermission(["purchaseorders.create"]) && (
                                <Link href="/admin/po/create" className="btn btn-success">
                                    <i className="bi bi-plus-circle-fill me-2"></i> Tambah Purchase Order
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border">
                            <div className="card-body p-0">
                                <div className="table-responsive p-4">
                                    <table className="table align-middle table-hover">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="text-center">No.</th>
                                                <th>PO Number</th>
                                                <th>Store</th>
                                                <th>Supplier</th>
                                                <th>User</th>
                                                <th>Total Price</th>
                                                <th>Status</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.length > 0 ? (
                                                filteredOrders.map((order, index) => (
                                                    <tr key={order.id}>
                                                        <td className="text-center">
                                                            {index + 1 + (purchaseOrders.current_page - 1) * purchaseOrders.per_page}
                                                        </td>
                                                        <td>{order.po_number}</td>
                                                        <td>{order.store?.name || "-"}</td>
                                                        <td>{order.supplier?.name || "-"}</td>
                                                        <td>{order.user?.name || "-"}</td>
                                                        <td>{formatRupiah(order.total_price)}</td>
                                                        <td>
                                                            <span
                                                                className={`badge bg-${order.status === "pending"
                                                                    ? "warning"
                                                                    : order.status === "confirmed"
                                                                        ? "primary"
                                                                        : "success"
                                                                    }`}
                                                            >
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            {hasAnyPermission(["purchaseorders.edit"]) && order.status !== "confirmed" && (
                                                                <button
                                                                    onClick={() => handleEdit(order)}
                                                                    className="btn btn-outline-primary btn-sm me-2 rounded"
                                                                    aria-label={`Edit purchase order ${order.po_number}`}
                                                                >
                                                                    <i className="bi bi-pencil-fill"></i> Edit
                                                                </button>
                                                            )}
                                                            {hasAnyPermission(["purchaseorders.delete"]) && order.status !== "confirmed" && (
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm rounded me-2"
                                                                    onClick={() => handleDelete(order.id)}
                                                                    aria-label={`Delete purchase order ${order.po_number}`}
                                                                >
                                                                    <i className="bi bi-trash-fill"></i> Delete
                                                                </button>
                                                            )}
                                                            {order.status !== "confirmed" && (
                                                                <Link
                                                                    href={`/admin/po/${order.id}/items`}
                                                                    className="btn btn-outline-info btn-sm me-2 rounded"
                                                                    aria-label={`View items for purchase order ${order.po_number}`}
                                                                >
                                                                    <i className="bi bi-box-seam"></i> Items
                                                                </Link>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
                                                        No purchase orders found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                <Pagination links={purchaseOrders.links} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for Edit Status */}
                {showModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Status PO: {selectedPO?.po_number}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="received">Received</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleUpdateStatus}
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    )
}
