import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.notFoundIcon}>
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h1>404</h1>
        <h2>Halaman Tidak Ditemukan</h2>
        <p>
          Maaf, halaman yang Anda cari tidak ditemukan. Mungkin halaman telah
          dihapus atau alamat URL yang Anda masukkan salah.
        </p>

        <div className={styles.notFoundActions}>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-house-door me-2"></i>Kembali ke Beranda
          </Link>
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={() => window.history.back()}
          >
            <i className="bi bi-arrow-left me-2"></i>Kembali ke Halaman
            Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
