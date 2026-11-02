import React from "react"
import { formatRupiah } from "../utils/rupiah"

const Receipt = React.forwardRef(
    ({ cartItems, subTotal, discount = 0, totalAmount, cash, change, invoice }, ref) => {
        return (
            <div ref={ref} className="p-2" style={{
                fontSize: "12px",
            }}>
                {/* Header Struk */}
                <div className="text-center mb-2">
                    <div>AlphaPOS</div>
                    <div>Jl. Raya No. 123</div>
                    <div>Karawang, Jawa Barat</div>
                    <div >Tel: (021) 12345678</div>
                    <div>--------------------------------</div>
                    <div >{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>

                    <div>No. Invoice: {invoice}</div>
                    <div>--------------------</div>
                </div>

                {/* Daftar Item */}
                <div className="mb-2 ">
                    {cartItems.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between ">
                            <div>
                                <div>{item.name || "Produk"}</div>
                                <div>
                                    {item.quantity} X {formatRupiah(item.selling_price)}
                                </div>
                            </div>
                            <div className="text-end ">
                                {formatRupiah(item.total_price)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Garis Pembatas */}
                <div className="mb-2 text-center">------------------------</div>

                {/* Total Pembayaran */}
                <div className="mb-2 ">
                    <div className="d-flex justify-content-between ">
                        <span>SUBTOTAL:</span>
                        <span>{formatRupiah(subTotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="d-flex justify-content-between ">
                            <span className="">DISKON:</span>
                            <span className="text-danger">-{formatRupiah(discount)}</span>
                        </div>
                    )}
                    <div className="d-flex justify-content-between ">
                        <span>TOTAL:</span>
                        <span>{formatRupiah(totalAmount)}</span>
                    </div>
                </div>

                {/* Pembayaran */}
                <div className="mb-2">
                    <div className="d-flex justify-content-between ">
                        <span>CASH:</span>
                        <span>{formatRupiah(cash)}</span>
                    </div>
                    <div className="d-flex justify-content-between ">
                        <span>KEMBALI:</span>
                        <span>{formatRupiah(change)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-3 ">
                    <div>*** TERIMA KASIH ***</div>
                    <div>Barang yang sudah dibeli</div>
                    <div>tidak dapat ditukar atau dikembalikan</div>
                    <div className="mt-2">www.alphapos.my.id</div>
                </div>
            </div>
        )
    }
)

export default Receipt
