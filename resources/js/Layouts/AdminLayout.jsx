import Sidebar from "../Components/Sidebar"
import NavbarBackend from "../Components/Navbar"

const AdminLayout = ({ children }) => {
    return (
        // Pembungkus utama horizontal (Sidebar di kiri, Sisa area di kanan)
        <div className="d-flex min-vh-100 bg-light">

            {/* 1. Sidebar berdiri penuh di sebelah kiri */}
            <Sidebar />

            {/* 2. Area Kanan: Berisi Navbar atas & Konten Utama */}
            <div className="flex-grow-1 d-flex flex-column overflow-hidden">

                {/* Navbar berada di paling atas area kanan */}
                <NavbarBackend />

                {/* Main Content (Dashboard) */}
                <main className="page-content flex-grow-1 p-4 overflow-auto">
                    <div className="page-content-wrapper">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    )
}

export default AdminLayout
