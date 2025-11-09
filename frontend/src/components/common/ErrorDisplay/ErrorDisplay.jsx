import { Link } from "react-router-dom";
import styles from "./ErrorDisplay.module.css";

const ErrorDisplay = ({
  title = "Oops! Terjadi Kesalahan",
  message,
  onRetry,
  showRetry = true,
  showHomeLink = false,
}) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>

        <h2 className={styles.errorTitle}>{title}</h2>

        <p className={styles.errorMessage}>
          {message ||
            "Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
        </p>

        <div className={styles.errorActions}>
          {showRetry && onRetry && (
            <button className={styles.retryButton} onClick={onRetry}>
              <i className="bi bi-arrow-clockwise"></i> Coba Lagi
            </button>
          )}

          {showHomeLink && (
            <Link to="/" className={styles.homeButton}>
              <i className="bi bi-house-door"></i> Kembali ke Beranda
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
