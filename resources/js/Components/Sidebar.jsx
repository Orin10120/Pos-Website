import { Link, usePage } from "@inertiajs/react"
import NavItem from "../Components/NavItem"
import hasAnyPermission from "../utils/hasAnyPermission"

const Sidebar = () => {
    const { currentStore } = usePage().props

    const permissions = {
           roles: hasAnyPermission(["roles.index"]),
       }

    // Cek apakah ada permission untuk setiap kategori
    const hasUserManagement = permissions.roles || permissions.users

    return (
        <aside
            className="bg-dark text-white d-flex flex-column flex-shrink-0 p-3 min-vh-100"
            style={{ width: "250px" }}
        >
            {/* Logo / Brand */}
            <Link className="text-decoration-none text-center mb-3" href="/">
                <span className="h5 text-primary mb-0 fw-bold">
                    AlphaPOS
                </span>
            </Link>

            {/* Nama Store */}
            {currentStore && (
                <div className="d-flex flex-column align-items-center justify-content-center text-white w-100 rounded-3 p-2 bg-secondary bg-opacity-25 mb-3">
                    <i className="bi bi-shop-window fs-4 mb-1"></i>
                    <span className="fs-6 fw-semibold text-center">{currentStore.name}</span>
                </div>
            )}

            <hr className="text-secondary" />

            {/* Navigation Items */}
            <div className="flex-grow-1 overflow-auto">
                <ul className="nav nav-pills flex-column mb-auto">
                    {/* 1. DASHBOARD SECTION */}
                    <li className="nav-item text-white-50 mt-3 mb-1 text-muted ">Dashboard</li>
                    <NavItem
                        href="/admin/dashboard"
                        icon="bi-house-door"
                        label="Dashboard"
                    />

                    {/* 2. MANAGEMENT USER SECTION */}
                    {hasUserManagement && (
                        <>
                            <li className="nav-item text-white-50 mt-3 mb-1 text-muted ">Management User</li>

                            {permissions.roles && (
                                <NavItem
                                    href="/admin/roles"
                                    icon="bi-shield-lock"
                                    label="Roles"
                                />
                            )}

                        </>
                    )}
                </ul>

            </div>
        </aside>
    )
}

export default Sidebar
