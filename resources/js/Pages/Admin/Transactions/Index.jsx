import { useEffect, useRef, useCallback, useState } from "react"
import { usePage, router, Link } from "@inertiajs/react"
import Swal from "sweetalert2"
import { useReactToPrint } from "react-to-print"
import BarcodeScannerManual from "../../../Components/BarcodeScannerManual"

// Impor utilitas dan komponen
import { formatRupiah } from "../../../utils/rupiah"
import ProductList from "../../../Components/ProductList"
import Cart from "../../../Components/Cart"
import PaymentSection from "../../../Components/PaymentSection"
import CustomerSelector from "../../../Components/CustomerSelector"
import ModalProduk from "../../../Components/ModalProduk"
import Receipt from "../../../Components/Receipt"

// Impor custom hook dan action untuk manajemen state
import useSalesReducer, {
    setSelectedCustomer,
    setSelectedProduct,
    setQuantity,
    setShowModal,
    setCartItems,
    setProducts,
    setLoading,
    calculateSubtotal,
    filterProducts,
    resetSelections,
    setDiscount,
    setCash,
    setPaymentMethod,
    setSearchTerm,
    setShowReceiptModal,
    setSelectedCategory,
    setChange,
} from "../../useSalesReducer"

const Sales = () => {
    // Props dari controller
    const {
        errors,
        auth,
        isAdmin,
        carts = [],
        categories = [],
        products = [],
        customers = [],
    } = usePage().props

    // Inisialisasi reducer & state
    const { state, dispatch } = useSalesReducer()

    // Refs
    const componentRef = useRef()
    const searchInputRef = useRef(null)

    // State lokal
    const [transactionSnapshot, setTransactionSnapshot] = useState(null)
    const [showScanner, setShowScanner] = useState(false)
    const [lastAddedProduct, setLastAddedProduct] = useState(null)

    // Menampilkan notifikasi menggunakan SweetAlert2
    const showAlert = useCallback((title, text, icon, options = {}) => {
        Swal.fire({
            title,
            text,
            icon,
            confirmButtonText: "OK",
            customClass: { popup: "rounded-4" },
            ...options,
        })
    }, [])

    const handleBarcodeScan = (barcode) => {
        // Pencocokan toleran: buang spasi, samakan huruf besar-kecil.
        // Sering kasus barcode "AP-320" vs "ap-320 " di database jadi tidak cocok.
        const normalize = (value) => String(value ?? "").trim().toUpperCase().replace(/\s+/g, "")
        const target = normalize(barcode)
        const scannedProduct = products.find(product => normalize(product.barcode) === target)
        if (scannedProduct) {
            handleAddToCart(scannedProduct)
        } else {
            showAlert("Product Not Found", `Barcode "${barcode}" tidak cocok dengan produk mana pun.`, "error")
        }
    }

    const handleInputChange = (actionCreator) => (e) => {
        const value = e.target.value.replace(/[^\d]/g, "")
        dispatch(actionCreator(value))
    }

    const handleSelectProduct = (product) => {
        dispatch(setSelectedProduct(product))
        dispatch(setShowModal(false))
    }

    const handleDeleteProduct = (id) => {
        Swal.fire({
            title: "Hapus Item?",
            text: "Item akan dihapus dari keranjang.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            customClass: { popup: "rounded-4" }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/sales/delete-from-cart/${id}`, {
                    onSuccess: () => {
                        const updatedCart = state.cartItems.filter((item) => item.id !== id)
                        dispatch(setCartItems(updatedCart))
                        showAlert("Terhapus", "Item berhasil dihapus.", "success", {
                            toast: true,
                            position: "top-end",
                            showConfirmButton: false,
                            timer: 2000,
                        })
                    },
                    onError: () => showAlert("Error!", "Gagal menghapus item.", "error"),
                })
            }
        })
    }

    const handleAddToCart = async (product = null) => {
        const selectedProduct = product || state.selectedProduct

        if (!selectedProduct || !selectedProduct.id) {
            return showAlert("Perhatian!", "Silakan pilih produk terlebih dahulu.", "warning")
        }

        const quantity = Number(state.quantity)
        if (!Number.isInteger(quantity) || quantity < 1) {
            return showAlert("Perhatian!", "Kuantitas minimal adalah 1.", "warning")
        }

        const totalPrice = Number(selectedProduct.selling_price) * quantity

        const newItem = {
            customer_id: state.selectedCustomer,
            product_id: selectedProduct.id,
            quantity: quantity,
            total_price: totalPrice,
        }

        try {
            await router.post("/admin/sales/add-product", newItem, {
                onSuccess: (page) => {
                    dispatch(setCartItems(page.props.carts || []))
                    dispatch(resetSelections())
                    setLastAddedProduct(selectedProduct)
                    showAlert("Ditambahkan", "Produk masuk ke keranjang.", "success", {
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 2000,
                    })
                },
                onError: (error) => {
                    const message = error.response?.data?.message || "Gagal menambahkan produk."
                    showAlert("Error!", message, "error")
                },
            })
        } catch (error) {
            showAlert("Error!", "Terjadi kesalahan sistem.", "error")
        }
    }

    const handlePrintReceipt = useReactToPrint({
        contentRef: componentRef,
        onAfterPrint: () => {
            dispatch(setShowReceiptModal(false))
            dispatch(setCartItems([]))
            setTransactionSnapshot(null)
            router.get("/admin/sales", {}, { replace: true })
        }
    })

    const handleProcessPayment = async () => {
        const subTotal = state.subTotal
        const discount = parseFloat(state.discount) || 0
        const totalAmount = subTotal - discount

        if (isAdmin) {
            return showAlert("Akses Ditolak!", "Transaksi penjualan dilakukan oleh kasir, bukan akun admin. Silakan login dengan akun kasir untuk melakukan pembayaran.", "error")
        }

        const cash = state.paymentMethod === "cash" ? parseFloat(state.cash) || 0 : null

        if (state.paymentMethod === "cash" && cash < totalAmount) {
            return showAlert("Uang Kurang!", "Jumlah uang tunai kurang dari total belanja.", "error")
        }

        const snapshot = {
            cartItems: [...state.cartItems],
            subTotal,
            discount,
            totalAmount,
            cash,
            change: state.change,
        }
        setTransactionSnapshot(snapshot)

        const transactionData = {
            customer_id: state.selectedCustomer || null,
            total_amount: totalAmount,
            cash: cash,
            change: state.paymentMethod === "cash" ? state.change : null,
            discount: discount,
            cart_items: state.cartItems,
            payment_method: state.paymentMethod,
        }

        try {
            await router.post("/admin/sales/process-payment", transactionData, {
                onSuccess: (page) => {
                    const paymentRef = page.props.payment_link_url

                    if (state.paymentMethod === "online") {
                        if (!paymentRef) return showAlert("Error!", "Link pembayaran tidak tersedia.", "error")
                        // Xendit Invoice: arahkan kasir ke halaman pembayaran Xendit.
                        // Setelah selesai, Xendit redirect kembali ke halaman transaksi
                        // dan status transaksi diperbarui oleh webhook Xendit
                        // (POST /api/xendit/notification).
                        window.location.href = paymentRef
                    } else if (state.paymentMethod === "cash") {
                        Swal.fire({
                            title: "Pembayaran Sukses!",
                            text: "Apakah Anda ingin mencetak struk transaksi?",
                            icon: "success",
                            showCancelButton: true,
                            confirmButtonText: "Ya, Cetak",
                            cancelButtonText: "Lewati",
                            customClass: { popup: "rounded-4" }
                        }).then((res) => {
                            if (res.isConfirmed) {
                                dispatch(setShowReceiptModal(true))
                            } else {
                                router.visit('/admin/sales', { replace: true })
                                dispatch(setCartItems([]))
                                setTransactionSnapshot(null)
                            }
                        })
                        dispatch(setCash(""))
                        dispatch(setChange(0))
                        dispatch(setDiscount(""))
                        dispatch(setQuantity(1))
                    }
                },
                onError: () => showAlert("Error!", "Gagal memproses pembayaran.", "error"),
            })
        } catch {
            showAlert("Error!", "Terjadi kesalahan sistem.", "error")
        }
    }

    useEffect(() => {
        if (searchInputRef.current) searchInputRef.current.focus()
    }, [])

    useEffect(() => {
        if (!state.showModal && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [state.showModal])

    useEffect(() => {
        dispatch(setCartItems(carts))
        dispatch(setProducts(products))
        dispatch(setLoading(false))
    }, [carts, products, dispatch])

    useEffect(() => { dispatch(calculateSubtotal()) }, [state.cartItems, dispatch])

    useEffect(() => {
        if (state.paymentMethod === "cash") {
            const cashValue = parseFloat(state.cash) || 0
            const discountValue = parseFloat(state.discount) || 0
            const changeValue = cashValue - (state.subTotal - discountValue)
            dispatch(setChange(changeValue >= 0 ? changeValue : 0))
        } else {
            dispatch(setChange(0))
        }
    }, [state.cash, state.subTotal, state.discount, state.paymentMethod, dispatch])

    useEffect(() => {
        if (errors?.quantity) showAlert("Perhatian", errors.quantity, "warning")
    }, [errors, showAlert])

    useEffect(() => { dispatch(filterProducts()) }, [state.selectedCategory, state.searchTerm, dispatch])

    // Sembunyikan kartu feedback produk terakhir ditambahkan setelah beberapa detik
    useEffect(() => {
        if (!lastAddedProduct) return
        const timer = setTimeout(() => setLastAddedProduct(null), 4000)
        return () => clearTimeout(timer)
    }, [lastAddedProduct])

    useEffect(() => {
        if (state.showReceiptModal && transactionSnapshot) {
            setTimeout(() => { handlePrintReceipt() }, 100)
        }
    }, [state.showReceiptModal, transactionSnapshot])

    return (
        <div className="container-fluid py-4">
            {/* Top Navigation / Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1 text-dark">
                        <i className="bi bi-cash-stack text-primary me-2"></i> Kasir / Penjualan (POS)
                    </h3>
                    <p className="text-muted small mb-0">Kelola transaksi penjualan barang dengan cepat dan efisien</p>
                </div>
                <Link href="/admin/dashboard" className="btn btn-light border rounded-3 px-3 py-2 text-secondary shadow-sm">
                    <i className="bi bi-arrow-left me-1"></i> Kembali ke Dashboard
                </Link>
            </div>

            <div className="row g-4">
                {/* Kolom Kiri: Katalog Produk, Search & Kategori */}
                <div className="col-lg-7 col-xl-8">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            {/* Baris Pencarian & Tombol Aksi */}
                            <div className="row g-3 align-items-center mb-4">
                                <div className="col-md-7">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted ps-3">
                                            <i className="bi bi-search"></i>
                                        </span>
                                        <input
                                            id="search-product"
                                            type="text"
                                            className="form-control bg-light border-start-0 rounded-end-3 py-2.5"
                                            placeholder="Cari produk (Nama / Barcode)..."
                                            value={state.searchTerm}
                                            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                                            ref={searchInputRef}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-5 d-flex gap-2">
                                    <button
                                        className={`btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2.5 ${showScanner ? 'btn-danger' : 'btn-outline-primary'}`}
                                        onClick={() => setShowScanner(!showScanner)}
                                    >
                                        <i className={`bi ${showScanner ? 'bi-x-lg' : 'bi-upc-scan'}`}></i>
                                        <span>{showScanner ? 'Tutup Scanner' : 'Scan Barcode'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-light border text-muted px-3 rounded-3"
                                        data-bs-toggle="modal"
                                        data-bs-target="#exampleModal"
                                        title="Panduan Kasir"
                                    >
                                        <i className="bi bi-question-circle fs-5"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Filter Kategori Chips / Dropdown */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-muted">Kategori Produk</label>
                                <select
                                    className="form-select rounded-3 py-2"
                                    onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
                                    value={state.selectedCategory}
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Feedback: produk terakhir berhasil di-scan / ditambahkan */}
                            {lastAddedProduct && (
                                <div
                                    className="mb-4 p-3 rounded-4 d-flex align-items-center gap-3 border success-feedback"
                                    style={{ animation: "fadeInDown 0.3s ease-out", background: "#f0fdf4", borderColor: "#86efac" }}
                                >
                                    <img
                                        src={lastAddedProduct.image}
                                        alt={lastAddedProduct.name}
                                        className="rounded-3"
                                        style={{ width: 56, height: 56, objectFit: "cover", border: "1px solid rgba(0,0,0,0.06)" }}
                                    />
                                    <div className="flex-grow-1 min-width-0">
                                        <div className="small fw-semibold text-success d-flex align-items-center gap-1">
                                            <i className="bi bi-check-circle-fill"></i> Berhasil ditambahkan ke keranjang
                                        </div>
                                        <div className="fw-bold text-dark text-truncate">{lastAddedProduct.name}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-link text-success p-1"
                                        onClick={() => setLastAddedProduct(null)}
                                        aria-label="Tutup"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            )}

                            {/* Barcode Scanner View Component */}
                            {showScanner && (
                                <div className="mb-4 p-3 bg-light rounded-4 border">
                                    <BarcodeScannerManual
                                        onScanSuccess={handleBarcodeScan}
                                        onCancel={() => setShowScanner(false)}
                                    />
                                </div>
                            )}

                            {/* Daftar Produk Grid */}
                            <ProductList
                                products={state.filteredProducts}
                                loading={state.loading}
                                onSelectProduct={handleSelectProduct}
                            />
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Customer, Input Manual Item, Keranjang & Pembayaran */}
                <div className="col-lg-5 col-xl-4">
                    {/* Customer Selector */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <CustomerSelector
                                customers={customers}
                                selectedCustomer={state.selectedCustomer}
                                onSelectCustomer={(value) => dispatch(setSelectedCustomer(value))}
                                cashierName={auth.user.name}
                            />
                        </div>
                    </div>

                    {/* Pilih Produk Manual & Kuantitas */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                <i className="bi bi-bag-plus text-primary"></i> Tambah Item Cepat
                            </h6>
                            <div className="mb-3">
                                <label className="form-label small text-muted fw-semibold">Pilih Produk</label>
                                <div className="position-relative">
                                    <input
                                        className="form-control bg-light pe-5 py-2.5 rounded-3 cursor-pointer"
                                        type="text"
                                        placeholder="Klik untuk pilih produk..."
                                        value={state.selectedProduct?.name || ""}
                                        readOnly
                                        data-bs-toggle="modal"
                                        data-bs-target="#productModal"
                                    />
                                    <button
                                        className="bg-transparent px-3 py-0 border-0 position-absolute top-50 end-0 translate-middle-y text-primary"
                                        type="button"
                                        data-bs-toggle="modal"
                                        data-bs-target="#productModal"
                                    >
                                        <i className="bi bi-search"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small text-muted fw-semibold">Quantity</label>
                                <input
                                    type="number"
                                    className="form-control py-2.5 rounded-3"
                                    value={state.quantity}
                                    onChange={handleInputChange(setQuantity)}
                                    min="1"
                                />
                            </div>

                            <button
                                id="add-product-button"
                                className="btn btn-success w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                onClick={() => handleAddToCart()}
                            >
                                <i className="bi bi-cart-plus fs-5"></i>
                                <span className="fw-semibold">Masukkan ke Keranjang</span>
                            </button>
                        </div>
                    </div>

                    {/* Keranjang Belanja & Pembayaran */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                <i className="bi bi-cart3 text-primary"></i> Keranjang Belanja
                            </h5>
                            <Cart cartItems={state.cartItems} onDelete={handleDeleteProduct} />

                            <hr className="my-4 text-muted opacity-25" />

                            {/* Subtotal Display */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="text-muted fw-medium">Subtotal</span>
                                <h4 className="fw-bold mb-0 text-dark">
                                    {formatRupiah(state.subTotal)}
                                </h4>
                            </div>

                            {/* Section Pembayaran */}
                            <PaymentSection
                                discount={state.discount}
                                onDiscountChange={handleInputChange(setDiscount)}
                                subTotal={state.subTotal}
                                paymentMethod={state.paymentMethod}
                                onPaymentMethodChange={(e) => dispatch(setPaymentMethod(e.target.value))}
                                cash={state.cash}
                                onCashChange={handleInputChange(setCash)}
                                change={state.change}
                                onProcessPayment={handleProcessPayment}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Panduan Penggunaan Scanner */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold text-dark" id="exampleModalLabel">
                                <i className="bi bi-info-circle text-primary me-2"></i> Panduan Pemindai Barcode
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body py-4">
                            <ol className="ps-3 mb-0 text-secondary d-flex flex-column gap-2">
                                <li>Unduh atau siapkan barcode produk dari tabel produk master.</li>
                                <li>Klik tombol <strong className="text-dark">"Scan Barcode"</strong> untuk mengaktifkan kamera.</li>
                                <li>Arahkan kamera ke barcode barang. Sistem otomatis mendeteksi dan memasukkan produk ke keranjang.</li>
                            </ol>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-primary px-4 rounded-3" data-bs-dismiss="modal">Mengerti</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal untuk Pemilihan Produk */}
            <ModalProduk
                products={state.filteredProducts}
                onSelect={handleSelectProduct}
                showModal={state.showModal}
                onClose={() => dispatch(setShowModal(false))}
            />

            {/* Hidden Receipt Component untuk Cetak Struk */}
            {transactionSnapshot && (
                <div style={{ display: "none" }}>
                    <Receipt
                        ref={componentRef}
                        cartItems={transactionSnapshot.cartItems}
                        subTotal={transactionSnapshot.subTotal}
                        discount={transactionSnapshot.discount}
                        totalAmount={transactionSnapshot.totalAmount}
                        cash={transactionSnapshot.cash}
                        change={transactionSnapshot.change}
                    />
                </div>
            )}

            {/* Modal Opsi Cetak Struk Selesai */}
            {state.showReceiptModal && transactionSnapshot && (
                <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center">
                            <div className="mb-3">
                                <div className="bg-success-subtle text-success rounded-circle d-inline-flex p-3 fs-1">
                                    <i className="bi bi-check-circle-fill"></i>
                                </div>
                            </div>
                            <h4 className="fw-bold mb-2">Transaksi Selesai!</h4>
                            <p className="text-muted mb-4">Silakan cetak struk transaksi untuk pelanggan.</p>
                            <div className="d-flex gap-2 justify-content-center">
                                <button className="btn btn-primary px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2" onClick={handlePrintReceipt}>
                                    <i className="bi bi-printer"></i> Print Receipt
                                </button>
                                <button className="btn btn-light border px-4 py-2.5 rounded-3" onClick={() => {
                                    dispatch(setShowReceiptModal(false))
                                    router.visit('/admin/sales', { replace: true })
                                    dispatch(setCartItems([]))
                                    setTransactionSnapshot(null)
                                }}>
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sales
