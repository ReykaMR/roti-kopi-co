import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import logoAplikasi from "../../../assets/images/logo/aplikasi.png";
import { setCredentials } from "../../../store/slices/authSlice";
import { authService } from "../../../services/authService";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import styles from "./Login.module.css";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("request");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  const orderType = location.state?.orderType;
  const tableNumber = location.state?.tableNumber;

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        handleRedirect(user, from);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleRedirect = (user, fromPath) => {
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user.role === "kasir") {
      navigate("/kasir", { replace: true });
    } else {
      if (fromPath && fromPath !== "/" && fromPath !== "/login") {
        navigate(fromPath, { replace: true });
      } else if (orderType) {
        const params = new URLSearchParams({ orderType });
        if (tableNumber) params.append("tableNumber", tableNumber);
        navigate(`/our-menu?${params.toString()}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    setError(null);
    setMessage("");

    if (!phoneNumber || !/^[0-9]{9,15}$/.test(phoneNumber)) {
      setError("Harap masukkan nomor telepon yang valid (9-15 digit angka)");
      setIsLoading(false);
      return;
    }

    try {
      const formattedPhone = phoneNumber.replace(/^\+62/, "").replace(/^0/, "");
      const response = await authService.requestOTP(formattedPhone);

      setStep("verify");

      if (response.otp) {
        setMessage(`Kode OTP telah dikirim. Kode OTP Anda: ${response.otp}`);
      } else {
        setMessage(
          "Kode OTP telah dikirim. Silakan periksa console browser untuk melihat OTP."
        );
      }
    } catch (error) {
      const errorMsg = error.message || "Gagal mengirim OTP";
      setError(errorMsg);
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    setError(null);
    setMessage("");

    if (!otpCode || !/^[0-9]{6}$/.test(otpCode)) {
      setError("Harap masukkan 6 digit kode OTP yang valid");
      setIsLoading(false);
      return;
    }

    try {
      const formattedPhone = phoneNumber.replace(/^\+62/, "").replace(/^0/, "");
      const response = await authService.verifyOTP(formattedPhone, otpCode);

      setMessage("Login berhasil! Mengarahkan...");

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
        })
      );

      setTimeout(() => {
        handleRedirect(response.user, from);
      }, 1000);
    } catch (err) {
      const errorMsg = err.message || "Terjadi kesalahan server";
      setError(errorMsg);
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtpCode("");
    setError(null);
    setMessage("");
    handleRequestOTP();
  };

  if (error && !message) {
    return (
      <LoadingError
        message={`Login gagal: ${error}`}
        onRetry={() => {
          setError(null);
          setMessage("");
          setStep("request");
          setOtpCode("");
        }}
        showHomeLink={true}
      />
    );
  }

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
                  {step === "request" ? "Login Pelanggan" : "Verifikasi OTP"}
                </h2>
                <p className={`text-muted mb-4 ${styles.loginSubtitle}`}>
                  {step === "request"
                    ? "Masukkan nomor ponsel Anda untuk memulai pemesanan"
                    : "Masukkan 6 digit kode OTP yang telah dikirim"}
                </p>
              </div>

              {/* Message Alert */}
              {message && (
                <div
                  className={`alert ${
                    step === "verify" && error
                      ? "alert-danger"
                      : step === "verify"
                      ? "alert-info"
                      : "alert-primary"
                  } alert-dismissible fade show mb-4 ${styles.message}`}
                  role="alert"
                >
                  {message}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage("")}
                  ></button>
                </div>
              )}

              {/* Request OTP Form */}
              {step === "request" ? (
                <form onSubmit={handleRequestOTP}>
                  <div className="mb-4">
                    <label
                      htmlFor="phoneNumber"
                      className={`form-label fw-semibold ${styles.inputLabel}`}
                    >
                      Nomor Telepon
                    </label>
                    <div className="input-group">
                      <span
                        className={`input-group-text`}
                      >
                        +62
                      </span>
                      <input
                        type="tel"
                        className={`form-control ${styles.formControl} ${
                          error && step === "request" ? "is-invalid" : ""
                        }`}
                        id="phoneNumber"
                        placeholder="8123456789"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, ""));
                          setError(null);
                        }}
                        required
                        disabled={isLoading}
                        maxLength={15}
                      />
                    </div>
                    {/* {error && step === "request" && (
                      <div className="invalid-feedback d-block">{error}</div>
                    )} */}
                  </div>

                  <button
                    type="submit"
                    className={`w-100 py-2 fw-semibold ${styles.loginButton}`}
                    disabled={isLoading || !phoneNumber}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Mengirim OTP...
                      </>
                    ) : (
                      "Request OTP"
                    )}
                  </button>
                </form>
              ) : (
                /* Verify OTP Form */
                <form onSubmit={handleVerifyOTP}>
                  <div className="mb-4">
                    <label
                      htmlFor="otpCode"
                      className={`form-label fw-semibold ${styles.inputLabel}`}
                    >
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      className={`form-control ${styles.formControl} ${
                        error ? "is-invalid" : ""
                      }`}
                      id="otpCode"
                      placeholder="Masukkan 6 digit kode OTP"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        );
                        setError(null);
                      }}
                      required
                      disabled={isLoading}
                      maxLength={6}
                    />
                    {error && (
                      <div className="invalid-feedback d-block">{error}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`w-100 py-2 fw-semibold mb-3 ${styles.loginButton}`}
                    disabled={isLoading || otpCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Memverifikasi...
                      </>
                    ) : (
                      "Verifikasi OTP"
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className={`btn btn-link p-0 text-decoration-none ${styles.resendButton}`}
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      {isLoading ? "Mengirim ulang..." : "Kirim ulang OTP"}
                    </button>
                  </div>
                </form>
              )}
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

export default Login;
