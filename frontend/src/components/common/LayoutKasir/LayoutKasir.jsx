import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { authService } from "../../../services/authService";
import styles from "./LayoutKasir.module.css";

const LayoutKasir = () => {
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
    } else if (currentUser.role !== "kasir" && currentUser.role !== "admin") {
      navigate("/unauthorized", { replace: true });
    }
  }, [currentUser, navigate]);

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === "/kasir") return "dashboard";
    if (path.includes("/kasir/orders")) return "orders";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

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
      path: "/kasir",
      roles: ["kasir", "admin"],
    },
    // {
    //   id: "orders",
    //   label: "Manajemen Pesanan",
    //   icon: "bi-cart",
    //   path: "/kasir/orders",
    //   roles: ["kasir", "admin"],
    // },
  ];

  if (
    !currentUser ||
    (currentUser.role !== "kasir" && currentUser.role !== "admin")
  ) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.kasirLayout}>
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
            <h2>Kasir Dashboard</h2>
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
                  {currentUser.nama || "Kasir"}
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
                      <strong>{currentUser.nama || "Kasir"}</strong>
                      <span>{currentUser.email || "kasir@rotikopico.com"}</span>
                      <small className="text-muted">
                        Role: {currentUser.role}
                      </small>
                    </div>
                  </div>
                  {/* <div className={styles.dropdownDivider}></div>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => navigate("/kasir/profile")}
                  >
                    <i className="bi bi-person"></i> Profil Saya
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => navigate("/kasir/settings")}
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

export default LayoutKasir;
