import { useState, useEffect, useRef } from "react"
import { usePage, router, Head, Deferred } from "@inertiajs/react"
import AdminLayout from "../../../Layouts/AdminLayout"
import { formatRupiah } from "../../../utils/rupiah"
import Receipt from "../../../Components/Receipt"
import { useReactToPrint } from "react-to-print"

const getPaymentMethodBadge = (method) => {
    const lowerCaseMethod = method?.toLowerCase() || "secondary"
    return {
        cash: "success",
        online: "primary",
        default: "secondary",
    }[lowerCaseMethod] || "secondary"
}

const calculateTotalQuantity = (transactions) => {
    if (!transactions || transactions.length === 0) return 0
    return transactions.reduce(
        (total, transaction) => total + (parseInt(transaction.total_quantity) || 0),
        0
    )
}

const transformItems = (items) =>
    !items
        ? []
        : items.map((item) => ({
            name: item.product_name,
            quantity: parseInt(item.quantity, 10) || 0,
            selling_price:
                item.subtotal && item.quantity
                    ? parseInt(item.subtotal, 10) / parseInt(item.quantity, 10)
                    : 0,
            total_price: parseInt(item.subtotal, 10) || 0,
        }))

export default function ReportIndex() {
    const {
        transactions,
        start_date,
        end_date,
        users,
        totalAmount,
        selectedUserId,
        errors,
        totalSuccess,
        totalPending,
    } = usePage().props

    const [startDate, setStartDate] = useState(start_date || "")
    const [endDate, setEndDate] = useState(end_date || "")
    const [selectedUser, setSelectedUser] = useState(selectedUserId || "")

    useEffect(() => {
        setSelectedUser(selectedUserId)
    }, [selectedUserId])

    const handleSubmit = (e) => {
        e.preventDefault()
        const userIdToSend = selectedUser || null
        router.get("/admin/report/generate", {
            start_date: startDate,
            end_date: endDate,
            user_id: userIdToSend,
        })
    }

    const componentRef = useRef(null)

    const handlePrintReceipt = useReactToPrint({
        contentRef: componentRef,
    })

    const totalQuantity = calculateTotalQuantity(transactions)

    return (
        <>
            <Head>
                <title>Laporan Transaksi - AlphaPOS</title>
            </Head>

            <AdminLayout>
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                        <h3 className="font-weight-bold m-0">
                            <i className="bi bi-graph-up me-2"></i> Laporan Transaksi
                        </h3>
                    </div>

                    {/* Total Amount, Total Transaksi, Total Kuantitas, Total Success, dan Total Pending Cards */}
                    <div className="row mb-4 g-3">
                        {[
                            { label: "Total Penjualan", value: totalAmount, color: "success", isRupiah: true },
                            { label: "Total Semua Transaksi", value: transactions?.length, color: "primary", isRupiah: false },
                            { label: "Total Kuantitas", value: totalQuantity, color: "info", isRupiah: false },
                            { label: "Total Transaksi Success", value: totalSuccess, color: "success", isRupiah: true },
                            { label: "Total Transaksi Pending", value: totalPending, color: "warning", isRupiah: true },
                        ].map(({ label, value, color, isRupiah }, index) => (
                            <div key={index} className="col-12 col-lg-4">
                                <div className="card h-100 border-1 p-4">
                                    <h6 className="text-muted mb-2">{label}</h6>
                                    <h3 className={`text-${color} mb-0`}>
                                        {isRupiah ? formatRupiah(value || 0) : (value || 0).toLocaleString('id-ID')}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter dan Tabel dalam Grid yang Seimbang */}
                    <div className="row g-3">
                        {/* Filter */}
                        <div className="col-12 col-lg-4">
                            <div className="card  border-1 h-100">
                                <div className="card-body p-4">
                                    <h5 className="card-title mb-4">Filter Transaksi</h5>
                                    <form onSubmit={handleSubmit} className="d-grid gap-3">
                                        {[
                                            {
                                                id: "start_date",
                                                label: "Tanggal Mulai",
                                                value: startDate,
                                                onChange: setStartDate,
                                                error: errors?.start_date,
                                            },
                                            {
                                                id: "end_date",
                                                label: "Tanggal Selesai",
                                                value: endDate,
                                                onChange: setEndDate,
                                                error: errors?.end_date,
                                            },
                                        ].map(({ id, label, value, onChange, error }) => (
                                            <div key={id} className="mb-3">
                                                <label htmlFor={id} className="form-label text-muted">
                                                    {label}
                                                </label>
                                                <input
                                                    type="date"
                                                    id={id}
                                                    value={value}
                                                    onChange={(e) => onChange(e.target.value)}
                                                    className={`form-control ${error ? "is-invalid" : ""}`}
                                                    required
                                                />
                                                {error && <div className="invalid-feedback">{error}</div>}
                                            </div>
                                        ))}

                                        <div className="mb-3">
                                            <label htmlFor="user_id" className="form-label text-muted">
                                                Pengguna
                                            </label>
                                            <select
                                                id="user_id"
                                                value={selectedUser}
                                                onChange={(e) => setSelectedUser(e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="">Semua Pengguna</option>
                                                {users.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button type="submit" className="btn btn-primary mt-2">
                                            <i className="bi bi-file-earmark-arrow-down me-2"></i> Buat Laporan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Tabel Transaksi */}
                        <div className="col-12 col-lg-8">
                            <div className="card border-1 h-100">
                                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center p-3">
                                    <h5 className="mb-0">
                                        <i className="bi bi-list-ul me-2"></i> Daftar Transaksi
                                    </h5>
                                    <span className="text-white-50">
                                        Total: {transactions?.length ?? 0} Transaksi
                                    </span>
                                </div>

                                <div className="card-body p-0">
                                    <div
                                        className="table-responsive"
                                        style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}
                                    >
                                        <Deferred
                                            data="transactions"
                                            fallback={
                                                <div className="d-flex flex-column justify-content-center align-items-center my-4">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Memuat...</span>
                                                    </div>
                                                    <p className="mt-2 text-muted">Memuat transaksi...</p>
                                                </div>
                                            }
                                        >
                                            {transactions && transactions.length > 0 ? (
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead className="table-light sticky-top">
                                                        <tr>
                                                            {[
                                                                "Pelanggan",
                                                                "Tanggal Transaksi",
                                                                "Metode Pembayaran",
                                                                "Jumlah Total",
                                                                "Status",
                                                                "Kuantitas",
                                                                "Struk",
                                                            ].map((header) => (
                                                                <th key={header} className="text-nowrap">
                                                                    {header}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.map((transaction, index) => (
                                                            <tr key={transaction.id} className="align-middle">
                                                                <td>{transaction.customer?.name || "Guest"}</td>
                                                                <td>
                                                                    {new Date(transaction.transaction_date).toLocaleDateString(
                                                                        "id-ID"
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge bg-${getPaymentMethodBadge(
                                                                            transaction.payment_method
                                                                        )} text-white`}
                                                                    >
                                                                        {transaction.payment_method}
                                                                    </span>
                                                                </td>
                                                                <td className="text-end text-nowrap">
                                                                    {formatRupiah(Number(transaction.total_amount))}
                                                                </td>
                                                                <td className="text-center text-nowrap">
                                                                    <span
                                                                        className={`badge bg-${transaction.status === "success"
                                                                            ? "success"
                                                                            : transaction.status === "pending"
                                                                                ? "warning"
                                                                                : "danger"
                                                                            } text-white`}
                                                                    >
                                                                        {transaction.status}
                                                                    </span>
                                                                </td>
                                                                <td className="text-end">{transaction.total_quantity || 0}</td>
                                                                <td>
                                                                    {transaction.status === "success" ? (
                                                                        <>
                                                                            <button
                                                                                className="btn btn-primary"
                                                                                onClick={handlePrintReceipt}
                                                                            >
                                                                                Print Receipt
                                                                            </button>

                                                                            {/* Make Receipt visible */}
                                                                            <div style={{ display: "none" }}>
                                                                                <Receipt
                                                                                    ref={componentRef} // Pass the ref directly here
                                                                                    cartItems={transformItems(
                                                                                        transaction.transaction_details || []
                                                                                    )}
                                                                                    subTotal={
                                                                                        transaction.subtotal || transaction.total_amount
                                                                                    }
                                                                                    discount={transaction.discount || 0}
                                                                                    totalAmount={transaction.total_amount}
                                                                                    cash={transaction.cash || 0}
                                                                                    change={transaction.change || 0}
                                                                                    invoice={transaction.invoice}
                                                                                />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-muted">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-muted">Transaksi tidak ditemukan.</p>
                                                </div>
                                            )}
                                        </Deferred>
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
