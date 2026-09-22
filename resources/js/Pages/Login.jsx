import { useState, useRef, useEffect } from "react"
import { Head, router, useForm } from "@inertiajs/react"
import Webcam from "react-webcam"
import axios from "axios"
import Swal from "sweetalert2"

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [loginMethod, setLoginMethod] = useState("password")
    const [previewImage, setPreviewImage] = useState(null)
    const [faceDescriptor, setFaceDescriptor] = useState(null)

    const webcamRef = useRef(null)

    const { data, setData, errors, reset } = useForm({
        email: "",
        password: "",
        face_image: null,
        face_descriptor: null,
    })

    // 1. Load Model face-api dari window.faceapi
    useEffect(() => {
        const loadModels = async () => {
            try {
                // Tunggu sampai window.faceapi tersedia
                if (typeof window !== "undefined" && window.faceapi) {
                    const MODEL_URL = "/models"
                    await Promise.all([
                        window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                        window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                        window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    ])
                    setIsModelLoaded(true)
                }
            } catch (error) {
                console.error("Failed to load face-api models:", error)
            }
        }

        loadModels()
    }, [])

    // 2. Capture & Deteksi Wajah
    const handleCapture = async () => {
        if (!isModelLoaded || !window.faceapi) {
            Swal.fire("Sabar", "Model Face API sedang dimuat...", "warning")
            return
        }

        if (!webcamRef.current) return

        const imageSrc = webcamRef.current.getScreenshot()
        if (!imageSrc) return

        const img = new Image()
        img.src = imageSrc
        await img.decode()

        const detection = await window.faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor()

        if (!detection) {
            Swal.fire({
                icon: "error",
                title: "Wajah Tidak Terdeteksi",
                text: "Pastikan wajah Anda terlihat jelas pada kamera.",
            })
            return
        }

        const descriptorArray = Array.from(detection.descriptor)
        setFaceDescriptor(descriptorArray)

        const res = await fetch(imageSrc)
        const blob = await res.blob()
        const file = new File([blob], "face-image.jpg", { type: "image/jpeg" })

        setData((prevData) => ({
            ...prevData,
            face_image: file,
            face_descriptor: descriptorArray,
        }))

        setPreviewImage(imageSrc)

        Swal.fire({
            icon: "success",
            title: "Wajah Terdeteksi!",
            text: "Wajah berhasil ditangkap dan diproses.",
            timer: 1200,
            showConfirmButton: false,
        })
    }

    // 3. Handler Submit Login
    const loginHandler = (e) => {
        e.preventDefault()
        setIsLoading(true)

        if (loginMethod === "password") {
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
        } else {
            if (!data.face_image && !data.face_descriptor) {
                setIsLoading(false)
                Swal.fire({
                    icon: "warning",
                    title: "Wajah Belum Ditangkap",
                    text: "Silakan ambil foto wajah terlebih dahulu.",
                })
                return
            }

            const url = "/api/login-with-face"
            const formData = new FormData()
            formData.append("email", data.email)
            if (data.face_image) formData.append("face_image", data.face_image)
            if (data.face_descriptor) {
                formData.append("face_descriptor", JSON.stringify(data.face_descriptor))
            }

            axios
                .post(url, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                .then((response) => {
                    if (response.data.redirect) {
                        Swal.fire({
                            icon: "success",
                            title: "Login Successful",
                            text: "Face recognized!",
                            showConfirmButton: false,
                            timer: 1500,
                        })
                        window.location.href = response.data.redirect
                    }
                })
                .catch((error) => {
                    const errorMessage =
                        error.response?.data?.message || "Face recognition failed."
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: errorMessage,
                        confirmButtonColor: "#d33",
                        footer: "Make sure your face is clearly visible in the image.",
                    })
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }

    return (
        <>
            <Head>
                <title>Login - EasyPOS</title>
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
                                            <strong>Note:</strong> To use Face Login, please add a new user first in the <strong>Users</strong> menu.
                                        </small>
                                    </div>
                                )}

                                <form onSubmit={loginHandler} autoComplete="off">
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

                                    {/* Password / Face Capture */}
                                    {loginMethod === "password" ? (
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
                                    ) : (
                                        <div className="mb-4">
                                            <label className="form-label d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-medium">
                                                    Face Capture <span className="text-danger">*</span>
                                                </span>
                                                {!isModelLoaded && (
                                                    <span className="badge bg-warning text-dark">
                                                        Loading Models...
                                                    </span>
                                                )}
                                            </label>
                                            <div className="ratio ratio-4x3 mb-2 rounded overflow-hidden border bg-dark">
                                                <Webcam
                                                    ref={webcamRef}
                                                    screenshotFormat="image/jpeg"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-info mb-3 w-100 text-white"
                                                onClick={handleCapture}
                                                disabled={isLoading || !isModelLoaded}
                                            >
                                                {isModelLoaded ? "Capture & Process Face" : "Loading Face API..."}
                                            </button>
                                            {previewImage && (
                                                <div className="text-center">
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="img-thumbnail"
                                                        style={{ maxHeight: "150px" }}
                                                    />
                                                </div>
                                            )}
                                            {errors.face_image && (
                                                <small className="text-danger d-block mt-2">
                                                    {errors.face_image}
                                                </small>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-primary w-100 btn-lg fs-6 fw-semibold"
                                        type="submit"
                                        disabled={isLoading || (loginMethod === "face" && !isModelLoaded)}
                                    >
                                        {isLoading ? (
                                            <div
                                                className="spinner-border spinner-border-sm text-light"
                                                role="status"
                                            >
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
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
