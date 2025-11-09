import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import logoHalal from "../../../assets/images/halal.png";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import styles from "./Discover.module.css";

const Discover = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat data discover");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const hash = location.hash.substring(1);
    if (
      hash &&
      ["about", "history", "vision", "safety", "halal", "contact"].includes(
        hash
      )
    ) {
      setActiveTab(hash);

      const tabContainer = document.getElementById("tab-container");
      if (tabContainer) {
        tabContainer.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, null, `#${tab}`);
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: "var(--primary-color)" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading discover content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <LoadingError
        message={error}
        onRetry={() => window.location.reload()}
        showHomeLink={true}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <div className={styles.tabContent} id="about">
            <h3>Tentang Roti & Kopi Co</h3>
            <p>
              Roti & Kopi Co hadir untuk menemani setiap momen hangat Anda
              dengan pilihan roti yang selalu fresh from the oven dan racikan
              kopi terbaik. Kami percaya bahwa setiap gigitan roti dan setiap
              tegukan kopi dapat menghadirkan kebahagiaan sederhana dalam
              keseharian.
            </p>
            <p>
              Dengan bahan-bahan berkualitas, resep autentik, serta sentuhan
              inovasi, kami terus berusaha memberikan pengalaman rasa yang tak
              hanya lezat, tetapi juga berkesan. Baik untuk bersantai, bekerja,
              maupun merayakan momen spesial, Roti & Kopi Co siap menjadi bagian
              dari cerita Anda.
            </p>
          </div>
        );
      case "history":
        return (
          <div className={styles.tabContent} id="history">
            <h3>Sejarah Kami</h3>
            <p>
              Roti & Kopi Co lahir pada tahun 2025, dari sebuah dapur kecil
              dengan mimpi besar: menghadirkan roti hangat dan kopi nikmat yang
              bisa menjadi bagian dari keseharian banyak orang. Awalnya, kami
              hanya membuat roti rumahan untuk keluarga dan teman dekat. Aroma
              roti yang baru keluar dari oven, dipadukan dengan secangkir kopi
              hangat, ternyata membawa kebahagiaan sederhana yang membuat orang
              ingin kembali lagi.
            </p>
            <p>
              Dari sanalah semangat itu tumbuh. Dukungan pelanggan pertama kami
              menjadi bahan bakar untuk terus berinovasi, menciptakan aneka roti
              dengan cita rasa autentik, sekaligus meracik kopi yang penuh
              karakter. Setiap langkah kecil di tahun pertama adalah
              pembelajaran—dari memilih bahan berkualitas, mencoba resep baru,
              hingga melayani pelanggan dengan sepenuh hati.
            </p>
            <p>
              Seiring waktu, Roti & Kopi Co berkembang menjadi lebih dari
              sekadar tempat membeli roti dan kopi. Kami ingin menciptakan ruang
              hangat di mana orang bisa berkumpul, berbagi cerita, atau sekadar
              menemukan ketenangan di sela rutinitas. Tahun demi tahun,
              perjalanan ini terus kami jalani dengan komitmen yang sama sejak
              awal: menghadirkan kebahagiaan dalam setiap gigitan dan tegukan.
            </p>
            <p>
              Kini, Roti & Kopi Co bukan hanya nama, melainkan cerita tentang
              kebersamaan, semangat, dan cinta sederhana yang tumbuh dari tahun
              2025 hingga hari ini.
            </p>
          </div>
        );
      case "vision":
        return (
          <div className={styles.tabContent} id="vision">
            <h3>Visi & Misi</h3>
            <div className={styles.visionMission}>
              <div className={styles.vision}>
                <h4>Visi</h4>
                <p>
                  Menjadi pilihan utama bagi pecinta roti dan kopi dengan
                  menghadirkan pengalaman hangat, autentik, dan berkesan di
                  setiap momen.
                </p>
              </div>
              <div className={styles.mission}>
                <h4>Misi</h4>
                <ul>
                  <li>
                    Menghadirkan roti dan kopi dengan kualitas terbaik dari
                    bahan pilihan yang segar dan terjamin.
                  </li>
                  <li>
                    Menjaga cita rasa autentik sambil terus berinovasi
                    menghadirkan menu baru yang sesuai dengan selera pelanggan.
                  </li>
                  <li>
                    Menciptakan ruang hangat yang nyaman sebagai tempat
                    berkumpul, berbagi cerita, dan membangun kenangan indah.
                  </li>
                  <li>
                    Memberikan pelayanan dengan sepenuh hati sehingga setiap
                    pelanggan merasa dihargai dan diperhatikan.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "safety":
        return (
          <div className={styles.tabContent} id="safety">
            <h3>Keamanan Pangan</h3>
            <p>
              Bagi Roti & Kopi Co, keamanan pangan adalah prioritas utama. Kami
              berkomitmen untuk memastikan setiap produk yang sampai ke tangan
              pelanggan tidak hanya lezat, tetapi juga aman dikonsumsi.
            </p>
            <p>
              Untuk itu, kami menerapkan standar kebersihan dan kualitas yang
              ketat dalam setiap tahap proses produksi, mulai dari pemilihan
              bahan baku segar, pengolahan dengan peralatan higienis, hingga
              penyimpanan dan penyajian yang sesuai prosedur.
            </p>
            <p>
              Kami juga mengacu pada standar HACCP (Hazard Analysis and Critical
              Control Points) serta ISO 22000 untuk memastikan setiap roti dan
              kopi yang kami hasilkan aman dan konsisten kualitasnya.
            </p>
            <p>
              Selain itu, seluruh tim kami secara berkala mendapatkan pelatihan
              mengenai higienitas dan sanitasi, agar setiap langkah produksi
              berjalan sesuai standar keamanan pangan.
            </p>
            <p>Standar Keamanan Pangan Kami:</p>
            <div className={styles.safetyStandards}>
              <div className={styles.standard}>
                <i className="bi bi-check-circle-fill"></i>
                <span>Bahan Baku Segar: dipilih dari pemasok terpercaya</span>
              </div>
              <div className={styles.standard}>
                <i className="bi bi-check-circle-fill"></i>
                <span>
                  Proses Higienis: area produksi bersih & peralatan steril
                </span>
              </div>
              <div className={styles.standard}>
                <i className="bi bi-check-circle-fill"></i>
                <span>
                  HACCP & ISO 22000: pengendalian risiko & manajemen mutu
                  terstruktur
                </span>
              </div>
              <div className={styles.standard}>
                <i className="bi bi-check-circle-fill"></i>
                <span>
                  Tim Terlatih: staf rutin mengikuti pelatihan keamanan pangan
                </span>
              </div>
            </div>
            <p>
              Dengan komitmen ini, setiap roti dan kopi yang Anda nikmati dari
              Roti & Kopi Co bukan hanya menghadirkan rasa istimewa, tetapi juga
              ketenangan karena terjamin aman untuk seluruh keluarga.
            </p>
          </div>
        );
      case "halal":
        return (
          <div className={styles.tabContent} id="halal">
            <h3>Sertifikasi Halal</h3>
            <div className={styles.halalContent}>
              <div className={styles.halalLogo}>
                <img src={logoHalal} alt="Sertifikat Halal" width="150" />
                {/* <p>Nomor Sertifikat: 00120034000505</p> */}
              </div>
              <div className={styles.halalInfo}>
                <p>
                  Roti & Kopi Co berkomitmen untuk menghadirkan produk yang
                  tidak hanya lezat dan aman, tetapi juga sesuai dengan standar
                  halal. Seluruh proses produksi, mulai dari pemilihan bahan
                  baku, pengolahan, hingga penyajian, telah mengikuti prosedur
                  halal yang ditetapkan oleh Majelis Ulama Indonesia (MUI).
                </p>
                <p>
                  Sebagai bentuk transparansi dan kepastian bagi pelanggan, Roti
                  & Kopi Co telah resmi mendapatkan Sertifikat Halal MUI dengan
                  nomor: ID0012001234562025
                </p>
                <p>
                  Dengan adanya sertifikasi ini, Anda dapat menikmati setiap
                  roti dan kopi dari Roti & Kopi Co dengan tenang, yakin bahwa
                  semua produk kami halal, higienis, dan berkualitas.
                </p>
              </div>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className={styles.tabContent} id="contact">
            <h3>Kontak Kami</h3>
            <div className={styles.contactContent}>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <i className="bi bi-geo-alt-fill"></i>
                  <div>
                    <h5>Alamat</h5>
                    <p>Jl. Lembang No. 123, Kota Bandung, Jawa Barat 40256</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-telephone-fill"></i>
                  <div>
                    <h5>Telepon</h5>
                    <p>+62 838 2161 2483</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-envelope-fill"></i>
                  <div>
                    <h5>Email</h5>
                    <p>info@roti-kopi-co.com</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <i className="bi bi-clock-fill"></i>
                  <div>
                    <h5>Jam Operasional</h5>
                    <p>Setiap Hari: 07.00 - 22.00</p>
                  </div>
                </div>
              </div>
              <div className={styles.contactForm}>
                <h5>Kirim Pesan</h5>
                <form>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nama Lengkap"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Subjek"
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Pesan"
                    ></textarea>
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    Kirim Pesan
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.discoverContainer}>
      <header className="container text-center my-5">
        <h1 className="section-title">Discover</h1>
        <p className={`lead ${styles.lead}`}>
          Temukan lebih banyak tentang Roti & Kopi Co
        </p>
      </header>

      <div className="container" id="tab-container">
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "about" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("about")}
          >
            <i className="bi bi-info-circle"></i> About Us
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "history" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("history")}
          >
            <i className="bi bi-clock-history"></i> History
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "vision" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("vision")}
          >
            <i className="bi bi-eye"></i> Vision & Mission
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "safety" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("safety")}
          >
            <i className="bi bi-shield-check"></i> Food Safety
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "halal" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("halal")}
          >
            <i className="bi bi-check-circle"></i> Halal
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "contact" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("contact")}
          >
            <i className="bi bi-envelope"></i> Contact
          </button>
        </div>

        <div className={styles.tabContainer}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default Discover;
