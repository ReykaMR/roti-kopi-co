import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { authService } from "../../../services/authService";
import styles from "./LayoutAdmin.module.css";

const LayoutAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user || storedUser;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      navigate("/admin-login", { replace: true });
    } else if (currentUser.role === "kasir") {
      navigate("/kasir", { replace: true });
    }
  }, [currentUser, navigate]);

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.includes("/admin/orders")) return "orders";
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/products")) return "products";
    if (path.includes("/admin/reports")) return "reports";
    if (path === "/admin") return "dashboard";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

  if (currentUser?.role === "kasir") {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    authService.logoutAdmin();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "bi-speedometer2",
      path: "/admin",
      roles: ["admin"],
    },
    {
      id: "users",
      label: "Manajemen Pengguna",
      icon: "bi-people",
      path: "/admin/users",
      roles: ["admin"],
    },
    {
      id: "products",
      label: "Manajemen Produk",
      icon: "bi-cup",
      path: "/admin/products",
      roles: ["admin"],
    },
    {
      id: "orders",
      label: "Manajemen Pesanan",
      icon: "bi-cart",
      path: "/admin/orders",
      roles: ["admin"],
    },
    {
      id: "reports",
      label: "Laporan",
      icon: "bi-graph-up",
      path: "/admin/reports",
      roles: ["admin"],
    },
  ];

  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <div
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <h3>Roti & Kopi Co</h3>
          <button className={styles.sidebarToggle} onClick={toggleSidebar}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`${styles.menuItem} ${
                    activeMenu === item.id ? styles.active : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.sidebarToggle} onClick={toggleSidebar}>
              <i className="bi bi-list text-dark"></i>
            </button>
            <h2>Admin Dashboard</h2>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.profileDropdown}>
              <button
                className={styles.profileButton}
                onClick={toggleProfileDropdown}
              >
                <div className={styles.profileAvatar}>
                  <i className="bi bi-person-circle"></i>
                </div>
                <span className={styles.profileName}>
                  {currentUser.nama || "Admin"}
                </span>
                <i
                  className={`bi bi-chevron-down ${
                    profileDropdownOpen ? styles.rotate : ""
                  }`}
                ></i>
              </button>

              {profileDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <div className={styles.dropdownInfo}>
                      <strong>{currentUser.nama || "Admin"}</strong>
                      <span>{currentUser.email || "admin@rotikopico.com"}</span>
                      <small className="text-muted">
                        Role: {currentUser.role}
                      </small>
                    </div>
                  </div>
                  {/* <div className={styles.dropdownDivider}></div>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => navigate("/admin/profile")}
                  >
                    <i className="bi bi-person"></i> Profil Saya
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => navigate("/admin/settings")}
                  >
                    <i className="bi bi-gear"></i> Pengaturan
                  </button> */}
                  <div className={styles.dropdownDivider}></div>
                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default LayoutAdmin;
