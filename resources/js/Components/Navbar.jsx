import { Link, router, usePage } from "@inertiajs/react"

const NavbarBackend = () => {
    const { auth } = usePage().props

    const logoutHandler = (e) => {
        e.preventDefault()
        router.post("/logout")
    }

    return (
        <nav className="navbar navbar-expand-xl navbar-light border-bottom py-0 py-xl-3">
            <div className="container-fluid p-0">
                <div className="d-flex align-items-center w-100">

                    <div className="d-flex align-items-center d-xl-none">
                        <Link className="navbar-brand" href="/">
                            <span className="navbar-brand-item h5 text-primary mb-0">
                                AlphaPOS
                            </span>
                        </Link>
                    </div>

                    {/* Tombol toggle sidebar */}
                    <div className="navbar-expand-xl sidebar-offcanvas-menu">
                        <button
                            className="navbar-toggler me-auto"
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasSidebar"
                            aria-controls="offcanvasSidebar"
                        >
                            <i className="bi bi-text-right fa-fw h2 mb-0"></i>
                        </button>
                    </div>

                    {/* Profil dan Logout */}
                    <div className="ms-xl-auto ms-auto">
                        <ul className="navbar-nav flex-row align-items-center">
                            <li className="nav-item ms-2 ms-md-3 dropdown">
                                {/* Dropdown Toggle */}
                                <a
                                    className="nav-link dropdown-toggle d-flex align-items-center"
                                    href="#"
                                    id="profileDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <span className="fw-bold me-1">{auth.user.name}</span>
                                    <i className="bi bi-chevron-down"></i>
                                </a>

                                {/* Dropdown Menu */}
                                <ul className="dropdown-menu dropdown-menu-end shadow pt-3" aria-labelledby="profileDropdown">
                                    <li>
                                        <a className="dropdown-item bg-danger-soft-hover" href="#" onClick={logoutHandler}>
                                            <i className="bi bi-power fa-fw me-2"></i>Logout
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </nav>
    )
}

export default NavbarBackend
