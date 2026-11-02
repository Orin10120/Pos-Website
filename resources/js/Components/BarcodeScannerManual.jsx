import { useCallback, useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library"

// Batasi format yang dicoba agar pembacaan jauh lebih cepat.
// Tanpa hint ini, ZXing mencoba semua format (QR, 2D, dll) di setiap frame kamera.
const SUPPORTED_FORMATS = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.CODE_128,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
    BarcodeFormat.QR_CODE,
]

const createReader = () => {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, SUPPORTED_FORMATS)
    // Baca barcode lebih teliti (tiap baris frame, bukan sampling) — penting untuk
    // webcam laptop yang fokusnya pas-pasan dan gambar barcode dari layar.
    hints.set(DecodeHintType.TRY_HARDER, true)
    return new BrowserMultiFormatReader(hints, 200)
}

const BarcodeScannerManual = ({ onScanSuccess, onCancel }) => {
    const videoRef = useRef(null)
    const readerRef = useRef(null)
    const cooldownRef = useRef(false)
    const onScanSuccessRef = useRef(onScanSuccess)

    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState(null)
    const [manualCode, setManualCode] = useState("")
    const [lastScannedCode, setLastScannedCode] = useState(null)

    // Selalu pakai callback terbaru tanpa harus restart kamera
    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess
    }, [onScanSuccess])

    // Start / stop kamera + decoding
    useEffect(() => {
        let mounted = true
        const reader = createReader()
        readerRef.current = reader

        const startScanner = async () => {
            if (!videoRef.current) return
            try {
                await reader.decodeFromConstraints(
                    {
                        video: {
                            // Webcam laptop: environment tidak tersedia, jadi fallback ke webcam biasa.
                            facingMode: { ideal: "environment" },
                            // Resolusi lebih tinggi = tiap batang barcode dapat lebih banyak piksel,
                            // jauh lebih mudah terbaca oleh kamera laptop.
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        },
                    },
                    videoRef.current,
                    (result) => {
                        if (!mounted || !result) return
                        // Abaikan scan berulang dalam waktu singkat (bounce dari satu barcode)
                        if (cooldownRef.current) return

                        cooldownRef.current = true
                        const barcode = result.getText()
                        setLastScannedCode(barcode)
                        onScanSuccessRef.current?.(barcode)

                        setTimeout(() => {
                            cooldownRef.current = false
                        }, 1500)
                    }
                )

                if (!mounted) return
                setCameraReady(true)
                videoRef.current?.play?.().catch(() => {})
            } catch (error) {
                if (!mounted) return
                setCameraError(
                    "Kamera tidak dapat diakses. Izinkan akses kamera pada browser, atau gunakan input manual di bawah."
                )
            }
        }

        startScanner()

        return () => {
            mounted = false
            try {
                readerRef.current?.reset()
            } catch {
                // diabaikan saat cleanup
            }
        }
    }, [])

    const handleManualSubmit = useCallback(
        (e) => {
            e.preventDefault()
            const code = manualCode.trim()
            if (!code) return
            onScanSuccessRef.current?.(code)
            setManualCode("")
        },
        [manualCode]
    )

    return (
        <div className="barcode-scanner">
            {/* Preview Kamera */}
            <div className="position-relative rounded-3 overflow-hidden bg-dark mb-3" style={{ minHeight: 180 }}>
                <video
                    ref={videoRef}
                    className="w-100 d-block"
                    style={{ objectFit: "cover", minHeight: 180, maxHeight: 280 }}
                    muted
                    playsInline
                />

                {!cameraReady && !cameraError && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white">
                        <div className="text-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            <span className="small">Mengaktifkan kamera...</span>
                        </div>
                    </div>
                )}

                {cameraError && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white p-3">
                        <div className="text-center small">
                            <i className="bi bi-camera-video-off fs-4 d-block mb-2"></i>
                            {cameraError}
                        </div>
                    </div>
                )}

                {/* Panduan bidik — garis horizontal sebagai acuan posisi barcode */}
                {cameraReady && (
                    <div
                        className="position-absolute top-50 start-50 translate-middle border border-2 border-success rounded-2 d-flex align-items-center justify-content-center"
                        style={{ width: "75%", height: 90, pointerEvents: "none", opacity: 0.75 }}
                    >
                        <span className="small fw-semibold text-success">Arahkan barcode ke sini</span>
                    </div>
                )}
            </div>

            {/* Indikasi kode terakhir yang terbaca kamera (untuk memastikan kamera bekerja) */}
            {cameraReady && (
                <div className="small text-muted d-flex align-items-center gap-2 mb-2">
                    {lastScannedCode ? (
                        <>
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span>
                                Terbaca: <code className="fw-bold">{lastScannedCode}</code>
                            </span>
                        </>
                    ) : (
                        <>
                            <i className="bi bi-camera-video"></i>
                            <span>Kamera aktif — pastikan barcode terbaca jelas dalam bingkai</span>
                        </>
                    )}
                </div>
            )}

            {/* Input Manual (fallback / scanner hardware keyboard) */}
            <form onSubmit={handleManualSubmit} className="mb-2">
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted ps-3">
                        <i className="bi bi-keyboard"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control bg-light border-start-0 rounded-end-3 py-2"
                        placeholder="Ketik / tempel barcode lalu tekan Enter"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        aria-label="Barcode manual"
                    />
                    <button type="submit" className="btn btn-success rounded-end-3 px-3" disabled={!manualCode.trim()}>
                        OK
                    </button>
                </div>
            </form>

            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-sm btn-outline-danger rounded-3" onClick={onCancel}>
                    <i className="bi bi-x-lg me-1"></i> Tutup Scanner
                </button>
            </div>
        </div>
    )
}

export default BarcodeScannerManual
