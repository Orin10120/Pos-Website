import React, { useState } from "react"
import { usePage, router, Head, Deferred } from "@inertiajs/react"
import AdminLayout from "../../../Layouts/AdminLayout"
import { formatRupiah } from "../../../utils/rupiah"

export default function ProfitIndex() {
    const {
        transactions,
        start_date = "",
        end_date = "",
        totalProfit = 0,
        totalProfitOnline = 0,
        totalProfitCash = 0,
        errors,
    } = usePage().props

    const [startDate, setStartDate] = useState(start_date)
    const [endDate, setEndDate] = useState(end_date)

    const handleSubmit = (e) => {
        e.preventDefault()
        router.get("/admin/profit/generate", { start_date: startDate, end_date: endDate })
    }

    const getPaymentBadge = (method) => ({
        cash: "success",
        online: "primary",
    }[method?.toLowerCase()] || "secondary")

    const formatPrice = (value) => value ? formatRupiah(value) : "-"
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID') : "-"

    const profitCards = [
        { title: "Total Profit", value: totalProfit, color: "success" },
        { title: "Profit (Online)", value: totalProfitOnline, color: "primary" },
        { title: "Profit (Cash)", value: totalProfitCash, color: "success" }
    ]

    return (
        <>
            <Head><title>Profit - AlphaPOS</title></Head>
            <AdminLayout>
                <div className="container-fluid">
                    <h3 className="font-weight-bold mb-4">
                        <i className="bi bi-graph-up"></i> Profit
                    </h3>

                    {/* Profit Cards */}
                    <div className="row mb-4 g-3">
                        {profitCards.map(({ title, value, color }, idx) => (
                            <div key={idx} className="col-md-4">
                                <div className="card border-1 p-4">
                                    <h6 className="text-muted mb-2">{title}</h6>
                                    <h2 className={`text-${color} mb-0`}>{formatPrice(value)}</h2>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-3">
                        {/* Filter */}
                        <div className="col-md-4 mb-4">
                            <div className="card border-1">
                                <div className="card-body">
                                    <h5 className="card-title">Filter Transactions</h5>
                                    <form onSubmit={handleSubmit}>
                                        {[
                                            { id: "start_date", label: "Start Date", value: startDate, setter: setStartDate },
                                            { id: "end_date", label: "End Date", value: endDate, setter: setEndDate }
                                        ].map(({ id, label, value, setter }) => (
                                            <div key={id} className="mb-3">
                                                <label htmlFor={id} className="form-label px-2">{label}</label>
                                                <input
                                                    type="date"
                                                    id={id}
                                                    value={value}
                                                    onChange={(e) => setter(e.target.value)}
                                                    className="form-control"
                                                    required
                                                />
                                                {errors?.[id] && (
                                                    <div className="alert alert-danger mt-2">{errors[id]}</div>
                                                )}
                                            </div>
                                        ))}
                                        <button type="submit" className="btn btn-primary w-100">
                                            <i className="bi bi-file-earmark-arrow-down"></i> Generate Report
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Table */}
                        <div className="col-md-8">
                            <div className="card border-1">
                                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 text-white">
                                        <i className="bi bi-list-ul"></i> Transaction List
                                    </h5>
                                    <span>Total Transactions: {transactions?.length ?? 0}</span>
                                </div>

                                <div className="card-body p-0">
                                    <div className="table-responsive p-4" style={{ maxHeight: "600px", overflowY: "auto" }}>
                                        <Deferred data="transactions" fallback={
                                            <div className="text-center my-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p>Loading transactions...</p>
                                            </div>
                                        }>
                                            {transactions?.length ? (
                                                <table className="table align-middle table-hover">
                                                    <thead className="bg-light text-white">
                                                        <tr>
                                                            {["Customer", "Invoice", "Transaction Date", "Payment Method", "Total Amount", "Status", "Profit"].map(header => (
                                                                <th key={header}>{header}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.map((transaction) => (
                                                            <tr key={transaction.id}>
                                                                <td>{transaction.customer?.name || "Guest"}</td>
                                                                <td>{transaction.invoice || "-"}</td>
                                                                <td>{formatDate(transaction.transaction_date)}</td>
                                                                <td>
                                                                    <span className={`badge bg-${getPaymentBadge(transaction.payment_method)}`}>
                                                                        {transaction.payment_method || "Unknown"}
                                                                    </span>
                                                                </td>
                                                                <td className="text-end">{formatPrice(transaction.total_amount)}</td>
                                                                <td className="text-center">
                                                                    <span className={`badge bg-${transaction.status === "success" ? "success" : "danger"}`}>
                                                                        {transaction.status || "Unknown"}
                                                                    </span>
                                                                </td>
                                                                <td className="text-end">{formatPrice(transaction.profit)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="text-center py-5">
                                                    <i className="bi bi-inbox display-1 text-muted"></i>
                                                    <h5 className="text-muted mt-3">No Transactions Found</h5>
                                                    <p className="text-muted">No transaction data available for the selected period.</p>
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
