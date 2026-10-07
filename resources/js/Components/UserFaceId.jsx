import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { isPasskeySupported, registerPasskeyForUser } from "../utils/passkeys"

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
        : "-"

export default function UserFaceId({ user, passkeys: initialPasskeys, highlight = false }) {
    const [passkeys, setPasskeys] = useState(initialPasskeys ?? [])
    const supported = isPasskeySupported()
    const [loading, setLoading] = useState(false)

    useEffect(() => setPasskeys(initialPasskeys ?? []), [initialPasskeys])


    const handleRegister = async () => {
        setLoading(true)
        try {
            const defaultName = `Face ID - ${user.name}`
            const passkey = await registerPasskeyForUser(user.id, defaultName)
            setPasskeys((prev) => [passkey, ...prev])
            Swal.fire({
                icon: "success",
                title: "Face ID Terdaftar",
                text: `${user.name} sekarang bisa login menggunakan Face ID di perangkat ini.`,
                timer: 2000,
                showConfirmButton: false,
            })
        } catch (error) {
            Swal.fire({ icon: "error", title: "Gagal Mendaftarkan Face ID", text: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (passkey) => {
        const confirm = await Swal.fire({
            icon: "warning",
            title: "Hapus Face ID?",
            text: `"${passkey.name}" tidak akan bisa dipakai login lagi.`,
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#d33",
        })
        if (!confirm.isConfirmed) return

        try {
            await axios.delete(`/admin/users/${user.id}/passkeys/${passkey.id}`)
            setPasskeys((prev) => prev.filter((p) => p.id !== passkey.id))
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal Menghapus",
                text: error.response?.data?.message || error.message,
            })
        }
    }

    return (
        <div className={`card border rounded-3 mb-5 ${highlight ? "border-primary border-2" : ""}`}>
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <h3 className="card-title fw-bold mb-0 fs-5">
                    <i className="bi bi-person-bounding-box me-2"></i>Face ID (Passkey)
                </h3>
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleRegister}
                    disabled={loading || !supported}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>Menunggu verifikasi...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-plus-circle me-2"></i>Daftarkan Face ID
                        </>
                    )}
                </button>
            </div>
            <div className="card-body">
                {highlight && (
                    <div className="alert alert-primary">
                        User berhasil dibuat. Klik <strong>Daftarkan Face ID</strong>, lalu minta{" "}
                        <strong>{user.name}</strong> memverifikasi wajahnya pada perangkat ini.
                    </div>
                )}
                {!supported && (
                    <div className="alert alert-warning">
                        Browser ini tidak mendukung WebAuthn. Pastikan situs diakses lewat HTTPS atau
                        <code> http://localhost</code>.
                    </div>
                )}
                <p className="small text-muted">
                    Wajah tidak pernah dikirim atau disimpan di server. Perangkat hanya membuat kunci yang terikat
                    ke akun ini, dan siapa pun yang wajahnya terdaftar di perangkat tersebut dapat login ke akun
                    ini. Lakukan pendaftaran hanya bersama pemilik akun. Jika perangkat ini tidak punya
                    biometrik (mis. Linux), pilih opsi "gunakan HP" lalu scan QR dengan Face ID/sidik jari di HP.
                </p>

                {passkeys.length === 0 ? (
                    <p className="text-muted mb-0">Belum ada Face ID yang terdaftar.</p>
                ) : (
                    <ul className="list-group">
                        {passkeys.map((passkey) => (
                            <li
                                key={passkey.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <div className="fw-medium">{passkey.name}</div>
                                    <small className="text-muted">
                                        Dibuat {formatDate(passkey.created_at)} · Terakhir dipakai{" "}
                                        {formatDate(passkey.last_used_at)}
                                    </small>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDelete(passkey)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
