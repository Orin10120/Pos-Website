import axios from "axios"

// ---------- base64url helpers ----------
const toBuffer = (value) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes.buffer
}

const toBase64Url = (buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

// ---------- options (JSON dari server -> format browser) ----------
const creationOptions = (json) => {
    if (window.PublicKeyCredential?.parseCreationOptionsFromJSON) {
        return window.PublicKeyCredential.parseCreationOptionsFromJSON(json)
    }
    return {
        ...json,
        challenge: toBuffer(json.challenge),
        user: { ...json.user, id: toBuffer(json.user.id) },
        excludeCredentials: (json.excludeCredentials || []).map((c) => ({ ...c, id: toBuffer(c.id) })),
    }
}

const requestOptions = (json) => {
    if (window.PublicKeyCredential?.parseRequestOptionsFromJSON) {
        return window.PublicKeyCredential.parseRequestOptionsFromJSON(json)
    }
    return {
        ...json,
        challenge: toBuffer(json.challenge),
        allowCredentials: (json.allowCredentials || []).map((c) => ({ ...c, id: toBuffer(c.id) })),
    }
}

// ---------- credential (hasil browser -> JSON untuk server) ----------
const credentialToJson = (credential) => {
    if (typeof credential.toJSON === "function") return credential.toJSON()

    const response = credential.response
    const json = {
        id: credential.id,
        rawId: toBase64Url(credential.rawId),
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults?.() ?? {},
        response: { clientDataJSON: toBase64Url(response.clientDataJSON) },
    }

    if (response.attestationObject) {
        json.response.attestationObject = toBase64Url(response.attestationObject)
        json.response.transports = response.getTransports?.() ?? []
    } else {
        json.response.authenticatorData = toBase64Url(response.authenticatorData)
        json.response.signature = toBase64Url(response.signature)
        if (response.userHandle) json.response.userHandle = toBase64Url(response.userHandle)
    }

    return json
}

// ---------- public API ----------
export const isPasskeySupported = () =>
    typeof window !== "undefined" && !!window.PublicKeyCredential && !!navigator.credentials

export const isPlatformAuthenticatorAvailable = async () => {
    if (!isPasskeySupported()) return false
    try {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch {
        return false
    }
}

const friendlyError = (error) => {
    if (error?.name === "NotAllowedError") return "Verifikasi dibatalkan atau waktu habis."
    if (error?.name === "InvalidStateError") return "Perangkat ini sudah terdaftar untuk user tersebut."
    if (error?.name === "SecurityError") return "Domain/URL tidak cocok dengan konfigurasi passkey (periksa APP_URL dan gunakan HTTPS atau localhost)."
    const validation = error?.response?.data?.errors
    if (validation) return Object.values(validation).flat().join(" ")
    return error?.response?.data?.message || error?.message || "Terjadi kesalahan."
}

/**
 * Admin mendaftarkan Face ID / passkey untuk user tertentu.
 * Perangkat akan meminta verifikasi biometrik (Face ID, Touch ID, Windows Hello, dll).
 */
export const registerPasskeyForUser = async (userId, name) => {
    try {
        const { data } = await axios.get(`/admin/users/${userId}/passkeys/options`)
        const credential = await navigator.credentials.create({ publicKey: creationOptions(data.options) })
        const response = await axios.post(`/admin/users/${userId}/passkeys`, {
            name,
            credential: credentialToJson(credential),
        })
        return response.data.passkey
    } catch (error) {
        throw new Error(friendlyError(error))
    }
}

/**
 * Login dengan Face ID / passkey (tanpa mengetik email atau password).
 * Mengembalikan URL redirect dari server.
 */
export const loginWithPasskey = async () => {
    try {
        const { data } = await axios.get("/passkeys/login/options")
        const credential = await navigator.credentials.get({ publicKey: requestOptions(data.options) })
        const response = await axios.post("/passkeys/login", {
            credential: credentialToJson(credential),
        })
        return response.data.redirect
    } catch (error) {
        throw new Error(friendlyError(error))
    }
}
