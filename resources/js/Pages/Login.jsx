import { useState } from "react"
import { Head, router, useForm } from "@inertiajs/react"
import Swal from "sweetalert2"
import { isPasskeySupported, loginWithPasskey } from "../utils/passkeys"

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const [loginMethod, setLoginMethod] = useState("password")
    const isFaceSupported = isPasskeySupported()

    const { data, setData, errors, reset } = useForm({
        email: "",
        password: "",
    })


    // Login dengan Face ID (WebAuthn / Passkey)
    const faceLoginHandler = async () => {
        setIsLoading(true)
        try {
            const redirect = await loginWithPasskey()
            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: "Face ID verified!",
                showConfirmButton: false,
                timer: 1500,
            })
            window.location.href = redirect || "/admin/dashboard"
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message || "Face ID verification failed.",
                confirmButtonColor: "#d33",
            })
            setIsLoading(false)
        }
    }

    // Handler Submit Login
    const loginHandler = (e) => {
        e.preventDefault()

        if (loginMethod === "face") {
            faceLoginHandler()
            return
        }

        setIsLoading(true)
        router.post(
            "/login",
            {
                email: data.email,
                password: data.password,
            },
            {
                onStart: () => setIsLoading(true),
                onSuccess: () => {
                    reset("password")
                    Swal.fire({
                        icon: "success",
                        title: "Login Successful",
                        text: "Welcome back!",
                        showConfirmButton: false,
                        timer: 1500,
                    })
                },
                onError: (errors) => {
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: errors.email || errors.password || "Invalid email or password",
                        confirmButtonColor: "#d33",
                    })
                },
                onFinish: () => setIsLoading(false),
            }
        )
    }

    return (
        <>
            <Head>
                <title>Login - AlphaPOS</title>
            </Head>
            <section className="p-0 min-vh-100 d-flex align-items-center bg-light">
                <div className="container-fluid p-0">
                    <div className="row g-0 min-vh-100">
                        {/* Left Banner Section */}
                        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 p-4 p-lg-5">
                            <div className="text-center">
                                <img
                                    src="https://is3.cloudhost.id/kodemastery/pos.webp"
                                    alt="EasyPOS"
                                    className="img-fluid mb-4"
                                    style={{ maxHeight: "280px" }}
                                    onError={(e) => {
                                        e.target.style.display = 'none'; // Fallback jika gambar gagal dimuat
                                    }}
                                />
                                <h2 className="fw-bold">Welcome to AlphaPOS</h2>
                                <p className="mb-0 h6 fw-light text-muted">Everything You Need!</p>
                            </div>
                        </div>

                        {/* Right Form Section */}
                        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4 p-lg-5">
                            <div className="w-100" style={{ maxWidth: "420px" }}>
                                <div className="mb-4 text-start">
                                    <span className="fs-1 d-block mb-2">👋</span>
                                    <h1 className="fs-2 fw-bold">AlphaPOS!</h1>
                                    <p className="text-muted mb-0">Please log in with your account.</p>
                                </div>

                                {/* Switch Login Method */}
                                <div className="d-flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        className={`btn w-50 ${
                                            loginMethod === "password"
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setLoginMethod("password")}
                                    >
                                        Password Login
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn w-50 ${
                                            loginMethod === "face"
                                                ? "btn-primary"
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setLoginMethod("face")}
                                    >
                                        Face Login
                                    </button>
                                </div>

                                {/* Note untuk Face Login */}
                                {loginMethod === "face" && (
                                    <div className="alert alert-info mb-4">
                                        <small>
                                            <strong>Note:</strong> Face ID harus didaftarkan lebih dulu oleh admin di menu <strong>Users</strong>. Wajah diverifikasi langsung oleh perangkat Anda dan tidak dikirim ke server.
                                        </small>
                                    </div>
                                )}

                                <form onSubmit={loginHandler} autoComplete="off">
                                    {loginMethod === "password" ? (
                                        <>
                                            {/* Email */}
                                            <div className="form-floating mb-3">
                                                <input
                                                    type="email"
                                                    className={`form-control ${
                                                        errors.email ? "is-invalid" : ""
                                                    }`}
                                                    id="loginEmail"
                                                    placeholder="E-mail *"
                                                    value={data.email}
                                                    onChange={(e) => setData("email", e.target.value)}
                                                    disabled={isLoading}
                                                    autoComplete="off"
                                                />
                                                <label htmlFor="loginEmail">
                                                    Email address <span className="text-danger">*</span>
                                                </label>
                                                {errors.email && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.email}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Password */}
                                            <div className="form-floating mb-4">
                                                <input
                                                    type="password"
                                                    className={`form-control ${
                                                        errors.password ? "is-invalid" : ""
                                                    }`}
                                                    id="loginPassword"
                                                    placeholder="Password *"
                                                    value={data.password}
                                                    onChange={(e) => setData("password", e.target.value)}
                                                    disabled={isLoading}
                                                    autoComplete="new-password"
                                                />
                                                <label htmlFor="loginPassword">
                                                    Password <span className="text-danger">*</span>
                                                </label>
                                                {errors.password && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.password}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center mb-4 py-3">
                                            <i className="bi bi-person-bounding-box display-1 text-primary"></i>
                                            <p className="text-muted mt-2 mb-0">
                                                Klik tombol di bawah, lalu verifikasi wajah Anda (Face ID / Windows Hello / sidik jari, atau lewat HP dengan scan QR).
                                            </p>
                                            {!isFaceSupported && (
                                                <div className="alert alert-warning mt-3 mb-0 text-start">
                                                    <small>
                                                        Browser ini tidak mendukung WebAuthn. Gunakan HTTPS atau localhost.
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-primary w-100 btn-lg fs-6 fw-semibold"
                                        type="submit"
                                        disabled={isLoading || (loginMethod === "face" && !isFaceSupported)}
                                    >
                                        {isLoading ? (
                                            <div
                                                className="spinner-border spinner-border-sm text-light"
                                                role="status"
                                            >
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        ) : loginMethod === "face" ? (
                                            "Login dengan Face ID"
                                        ) : (
                                            "Login"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
