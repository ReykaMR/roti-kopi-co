import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { authService } from "../../../services/authService";
import logoAplikasi from "../../../assets/images/logo/aplikasi.png";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else {
      const storedUser = authService.getStoredUser();
      setLocalUser(storedUser);
    }
  }, [user]);

  const handleLogout = () => {
    authService.logoutPelanggan();
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark fixed-top ${styles.navbar}`}
    >
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img
            src={logoAplikasi}
            alt="Roti & Kopi Co Logo"
            className={styles.brand}
          />
        </Link>
        <button
          className={`navbar-toggler ${styles.toggler}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className={`navbar-toggler-icon ${styles.togglerIcon}`}></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {localUser && localUser.role === "pelanggan" && (
              <li className={`nav-item px-2 ${styles.navItem}`}>
                <Link className={`nav-link ${styles.navLink}`} to="/order">
                  ORDER
                </Link>
              </li>
            )}

            {!localUser && (
              <>
                <li className={`nav-item px-2 ${styles.navItem}`}>
                  <Link className={`nav-link ${styles.navLink}`} to="/our-menu">
                    OUR MENU
                  </Link>
                </li>
                {/* <li className={`nav-item px-2 ${styles.navItem}`}>
                  <Link className={`nav-link ${styles.navLink}`} to="/promo">
                    PROMO
                  </Link>
                </li> */}
                <li className={`nav-item px-2 ${styles.navItem}`}>
                  <Link
                    className={`nav-link ${styles.navLink}`}
                    to="/special-event"
                  >
                    SPECIAL EVENT
                  </Link>
                </li>
                <li className={`nav-item px-2 ${styles.navItem}`}>
                  <Link className={`nav-link ${styles.navLink}`} to="/discover">
                    DISCOVER
                  </Link>
                </li>
              </>
            )}
          </ul>

          {localUser ? (
            <div className="dropdown">
              <button
                className={`btn dropdown-toggle ${styles.loginBtn}`}
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1"></i>
                {localUser.nama}
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="userDropdown"
              >
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="bi bi-person me-2"></i>Profil Saya
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders">
                    <i className="bi bi-cart me-2"></i>Pesanan Saya
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link className={`btn ${styles.loginBtn} px-4`} to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
