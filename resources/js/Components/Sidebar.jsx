import { Link, usePage } from "@inertiajs/react"
import NavItem from "../Components/NavItem"

const Sidebar = () => {
    const { currentStore } = usePage().props

    return (
        <nav
            className="navbar sidebar navbar-expand-xl navbar-light bg-dark text-white"
            style={{ overflowY: "auto" }}
        >
            <div className="d-flex flex-column align-items-center p-3">
                {/* Logo / Brand */}
                <Link className="navbar-brand text-center" href="/">
                    <span className="navbar-brand-item h5 text-primary mb-0">
                        EasyPOS
                    </span>
                </Link>

                {/* Nama Store */}
                {currentStore && (
                    <div className="d-flex flex-column align-items-center justify-content-center text-white w-100 rounded-3 shadow">
                        <i className="bi bi-shop-window fs-3 mb-2"></i>
                        <span className="fs-5 fw-semibold">Store: {currentStore.name}</span>
                    </div>
                )}
            </div>

            <div
                className="offcanvas offcanvas-start flex-row custom-scrollbar h-100 bg-dark"
                data-bs-backdrop="true"
                tabIndex="-1"
                id="offcanvasSidebar"
            >
                <div className="offcanvas-body sidebar-content d-flex flex-column">
                    <ul className="navbar-nav flex-column" id="navbar-sidebar">

                        {/* 1. DASHBOARD SECTION */}
                        <>
                            <li className="nav-item mt-3 mb-1 text-muted">Dashboard</li>
                            <NavItem
                                href="/admin/dashboard"
                                icon="bi-house-door"
                                label="Dashboard"
                            />
                        </>

                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Sidebar
