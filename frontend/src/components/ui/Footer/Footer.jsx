import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import logoAplikasi from "../../../assets/images/logo/aplikasi.png";
import logoHalal from "../../../assets/images/logo/halal.png";
import styles from "./Footer.module.css";

const Footer = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleDiscoverClick = (hash) => {
    if (window.location.pathname === "/discover") {
      const tabContainer = document.getElementById("tab-container");
      if (tabContainer) {
        tabContainer.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (isAuthenticated) {
    return (
      <footer className={styles.footer}>
        <div className="container">
          <div className="row">
            <div className="col-md-3 text-center text-md-start mb-4">
              <img
                src={logoAplikasi}
                alt="Roti & Kopi Co Logo"
                className={`${styles.logo} d-block mx-auto mx-md-0`}
              />
              <img
                src={logoHalal}
                alt="Sertifikasi Halal"
                className={styles.halal}
              />
              <div className={`d-flex ${styles.socialIcons}`}>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  aria-label="Instagram"
                  className={styles.socialIcon}
                >
                  <i className="bi bi-instagram"></i>
                </a>
                <a
                  href="https://www.tiktok.com/"
                  target="_blank"
                  aria-label="TikTok"
                  className={styles.socialIcon}
                >
                  <i className="bi bi-tiktok"></i>
                </a>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  aria-label="Facebook"
                  className={styles.socialIcon}
                >
                  <i className="bi bi-facebook"></i>
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  aria-label="YouTube"
                  className={styles.socialIcon}
                >
                  <i className="bi bi-youtube"></i>
                </a>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <h6 className={styles.sectionTitle}>Contact Us</h6>
              <p className={styles.contactInfo}>
                <i className={`bi bi-envelope ${styles.contactIcon}`}></i>{" "}
                info@roti-kopi-co.com
              </p>
              <p className={styles.contactInfo}>
                <i className={`bi bi-telephone ${styles.contactIcon}`}></i> +62
                838 2161 2483
              </p>
            </div>

            <div className="col-md-3 mb-4">
              <h6 className={styles.sectionTitle}>Big Order</h6>
              <p>
                Pemesanan dalam jumlah banyak untuk acara perusahaan atau
                keluarga.
              </p>

              <h6 className={`mt-4 ${styles.sectionTitle}`}>Birthday</h6>
              <p>Paket spesial ulang tahun dengan dekorasi dan kue custom.</p>
            </div>

            <div className="col-md-3">
              <h6 className={styles.sectionTitle}>
                Find Nearby Roti & Kopi Co
              </h6>
              <div className={styles.mapContainer}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d247.60237464823726!2d107.634571922248!3d-6.8138101472020605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNsKwNDgnNDkuNCJTIDEwN7KwMzgnMDQuMSJF!5e0!3m2!1sid!2sid!4v1757568338140!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Peta Lokasi Roti & Kopi Co"
                ></iframe>
              </div>
              <div className="mt-3">
                <p>
                  <i className={`bi bi-geo-alt ${styles.contactIcon}`}></i> Jl.
                  Lembang No. 123, Kota Bandung
                </p>
                <p>
                  <i className={`bi bi-clock ${styles.contactIcon}`}></i> Setiap
                  Hari: 07.00 - 22.00
                </p>
              </div>
            </div>
          </div>
          <div className={styles.copyright}>
            <p className="mb-0">© 2025 Roti & Kopi Co.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          <div className="col-md-3 text-center text-md-start mb-4">
            <img
              src={logoAplikasi}
              alt="Roti & Kopi Co Logo"
              className={`${styles.logo} d-block mx-auto mx-md-0`}
            />
            <img
              src={logoHalal}
              alt="Sertifikasi Halal"
              className={styles.halal}
            />
            <div className={`d-flex ${styles.socialIcons}`}>
              <a
                href="https://www.instagram.com/megalaelawati_"
                target="_blank"
                aria-label="Instagram"
                className={styles.socialIcon}
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                href="https://www.tiktok.com/@dihlih?_t=ZS-906T7g2ASut&_r=1"
                target="_blank"
                aria-label="TikTok"
                className={styles.socialIcon}
              >
                <i className="bi bi-tiktok"></i>
              </a>
              <a
                href="https://www.facebook.com/mega.laelawati.9"
                target="_blank"
                aria-label="Facebook"
                className={styles.socialIcon}
              >
                <i className="bi bi-facebook"></i>
              </a>
              {/* <a
                href="https://www.youtube.com/"
                target="_blank"
                aria-label="YouTube"
                className={styles.socialIcon}
              >
                <i className="bi bi-youtube"></i>
              </a> */}
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className={styles.sectionTitle}>Contact Us</h6>
            <p className={styles.contactInfo}>
              <i className={`bi bi-envelope ${styles.contactIcon}`}></i>{" "}
              info@roti-kopi-co.com
            </p>
            <p className={styles.contactInfo}>
              <i className={`bi bi-telephone ${styles.contactIcon}`}></i> +62
              838 2161 2483
            </p>

            <h6 className={`mt-4 ${styles.sectionTitle}`}>Discovery</h6>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link
                  to="/discover#about"
                  className={styles.link}
                  onClick={() => handleDiscoverClick("about")}
                >
                  <i className={`bi bi-arrow-right ${styles.linkIcon}`}></i>
                  About Us
                </Link>
              </li>
              <li className={styles.linkItem}>
                <Link
                  to="/discover#history"
                  className={styles.link}
                  onClick={() => handleDiscoverClick("history")}
                >
                  <i className={`bi bi-arrow-right ${styles.linkIcon}`}></i>
                  History
                </Link>
              </li>
              <li className={styles.linkItem}>
                <Link
                  to="/discover#vision"
                  className={styles.link}
                  onClick={() => handleDiscoverClick("vision")}
                >
                  <i className={`bi bi-arrow-right ${styles.linkIcon}`}></i>
                  Visi & Misi
                </Link>
              </li>
              <li className={styles.linkItem}>
                <Link
                  to="/discover#safety"
                  className={styles.link}
                  onClick={() => handleDiscoverClick("safety")}
                >
                  <i className={`bi bi-arrow-right ${styles.linkIcon}`}></i>
                  Food Safety
                </Link>
              </li>
              <li className={styles.linkItem}>
                <Link
                  to="/discover#halal"
                  className={styles.link}
                  onClick={() => handleDiscoverClick("halal")}
                >
                  <i className={`bi bi-arrow-right ${styles.linkIcon}`}></i>
                  Halal
                </Link>
              </li>
              <li className={styles.linkItem}>
                <Link
                  to="/discover#contact"
                  className={styles.link}
                  onClick={() => handleDiscoverClick("contact")}
                >
                  <i className={`bi bi-arrow-right ${styles.linkIcon}`}></i>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className={styles.sectionTitle}>Big Order</h6>
            <p>
              Pemesanan dalam jumlah banyak untuk acara perusahaan atau
              keluarga.
            </p>

            <h6 className={`mt-4 ${styles.sectionTitle}`}>Birthday</h6>
            <p>Paket spesial ulang tahun dengan dekorasi dan kue custom.</p>
          </div>

          <div className="col-md-3">
            <h6 className={styles.sectionTitle}>Find Nearby Roti & Kopi Co</h6>
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d247.60237464823726!2d107.634571922248!3d-6.8138101472020605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNsKwNDgnNDkuNCJTIDEwN7KwMzgnMDQuMSJF!5e0!3m2!1sid!2sid!4v1757568338140!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Peta Lokasi Roti & Kopi Co"
              ></iframe>
            </div>
            <div className="mt-3">
              <p>
                <i className={`bi bi-geo-alt ${styles.contactIcon}`}></i> Jl.
                Lembang No. 123, Kota Bandung
              </p>
              <p>
                <i className={`bi bi-clock ${styles.contactIcon}`}></i> Setiap
                Hari: 07.00 - 22.00
              </p>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          <p className="mb-0">© 2025 Roti & Kopi Co.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
