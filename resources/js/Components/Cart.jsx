import DataTable from "react-data-table-component"
import { formatRupiah } from "../utils/rupiah"

const Cart = ({ cartItems, onDelete }) => {
    const columns = [
        {
            name: "No",
            selector: (row, index) => index + 1,
            width: "70px",
        },
        {
            name: "Product Item",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Qty",
            selector: (row) => row.quantity,
            sortable: true,
            right: true,
        },
        {
            name: "Total",
            selector: (row) => formatRupiah(row.total_price),
            sortable: true,
            right: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(row.id)}
                >
                    <i className="bi bi-trash"></i> Delete
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ]

    const customStyles = {
        headCells: {
            style: {
                fontWeight: 'bold',
                fontSize: '16px',
            },
        },
        cells: {
            style: {
                fontSize: '14px',
            },
        },
    }

    return (
        <div className="card p-3">
            <div className="card-body">
                <h5 className="card-title mb-4">Shopping Cart</h5>
                <div
                    style={{
                        maxHeight: "150px",
                        overflowY: "auto",
                    }}
                >
                    <DataTable
                        columns={columns}
                        data={cartItems}
                        pagination
                        highlightOnHover
                        striped
                        noHeader
                        responsive
                        customStyles={customStyles}
                    />
                </div>
            </div>
        </div>
    )
}

export default Cart
