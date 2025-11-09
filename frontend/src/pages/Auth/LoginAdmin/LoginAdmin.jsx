import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../../store/slices/authSlice";
import logoAplikasi from "../../../assets/images/logo/aplikasi.png";
import styles from "./LoginAdmin.module.css";

const LoginAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.role === "kasir") {
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "kasir") {
          navigate("/kasir", { replace: true });
        }
      } else {
        console.warn(
          "User pelanggan mencoba akses halaman staff, melakukan logout..."
        );
        authService.logoutPelanggan();
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Email dan password harus diisi");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.loginAdmin(email, password);

      if (response && response.user && response.token) {
        dispatch(
          setCredentials({
            user: response.user,
            token: response.token,
          })
        );
      } else {
        setError("Response dari server tidak valid");
      }
    } catch (error) {
      let errorMsg = "Terjadi kesalahan saat login";

      if (error.response) {
        errorMsg = error.response.data?.error || "Email atau password salah";

        switch (error.response.status) {
          case 401:
            errorMsg = "Email atau password salah";
            break;
          case 400:
            errorMsg = "Data login tidak lengkap";
            break;
          case 403:
            errorMsg = "Akses ditolak. Role tidak diizinkan.";
            break;
          case 500:
            errorMsg = "Terjadi kesalahan server. Silakan coba lagi.";
            break;
          default:
            errorMsg = error.response.data?.error || "Terjadi kesalahan";
        }
      } else if (error.request) {
        errorMsg = "Tidak dapat terhubung ke server. Periksa koneksi Anda.";
      } else {
        errorMsg = error.message || "Terjadi kesalahan tidak terduga";
      }

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`container-fluid min-vh-100 d-flex align-items-center justify-content-center py-4 ${styles.loginContainer}`}
    >
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
          <div className={`card shadow-lg border-0 ${styles.loginCard}`}>
            <div className="card-body p-4 p-md-5">
              {/* Logo Section */}
              <div className="text-center mb-4">
                <img
                  src={logoAplikasi}
                  alt="Roti & Kopi Co Logo"
                  className={styles.loginLogo}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/120x50/";
                  }}
                />
                <h2 className={`card-title fw-bold mb-2 ${styles.loginTitle}`}>
                  Login Staff
                </h2>
                <p className={`text-muted mb-4 ${styles.loginSubtitle}`}>
                  Masukkan kredensial Anda untuk mengakses panel staff
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  className={`alert alert-danger alert-dismissible fade show mb-4 ${styles.message}`}
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className={`form-label fw-semibold ${styles.inputLabel}`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control ${styles.formControl} ${
                      error ? "is-invalid" : ""
                    }`}
                    id="email"
                    placeholder="staff@rotikopico.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className={`form-label fw-semibold ${styles.inputLabel}`}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${styles.formControl} ${
                      error ? "is-invalid" : ""
                    }`}
                    id="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-100 py-2 fw-semibold ${styles.loginButton}`}
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Memproses...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className={`text-center mt-4 ${styles.copyright}`}>
            <p>© 2025 Roti & Kopi Co.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
