import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HeroCarousel from "../../components/ui/HeroCarousel/HeroCarousel";
import MenuItemCard from "../../components/ui/MenuItemCard/MenuItemCard";
import LoadingError from "../../components/common/ErrorDisplay/LoadingError";
import styles from "./Home.module.css";
import { productService } from "../../services/productService";
import { setOrderType, addToCart } from "../../store/slices/orderSlice";
import { Alert } from "react-bootstrap";

const Home = () => {
  const [featuredCombos, setFeaturedCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const fetchFeaturedCombos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAllProducts({
        category: "combo",
        status: "available",
        limit: 3,
      });

      let products = [];
      if (response.products && Array.isArray(response.products)) {
        products = response.products;
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        products = response.data.products;
      } else if (Array.isArray(response)) {
        products = response;
      } else if (response.data && Array.isArray(response.data)) {
        products = response.data;
      } else {
        setError("Format data combo tidak valid");
        setProducts([]);
      }

      setFeaturedCombos(products.slice(0, 3));
    } catch (err) {
      setError(err.message || "Gagal memuat combo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCombos();
  }, []);

  const handleOrderTypeSelection = (orderType) => {
    dispatch(setOrderType(orderType));

    if (isAuthenticated && user?.role === "pelanggan") {
      navigate("/order");
    } else {
      navigate("/login", {
        state: {
          from: "/order",
          message: "Silakan login untuk melanjutkan pemesanan",
        },
      });
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated || user?.role !== "pelanggan") {
      navigate("/login", {
        state: {
          from: "/",
          message:
            "Silakan login sebagai pelanggan untuk menambahkan item ke keranjang",
        },
      });
      return;
    }

    dispatch(
      addToCart({
        product_id: product.product_id || product.id,
        nama: product.nama || product.name,
        harga: product.harga || product.price,
        gambar_url: product.gambar_url || product.image,
        quantity: 1,
      })
    );

    showNotification(
      `${product.nama || product.name} berhasil ditambahkan ke keranjang!`,
      "success"
    );
  };

  const showNotification = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  return (
    <div>
      {showAlert && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1055 }}
        >
          <Alert
            variant={alertVariant}
            dismissible
            onClose={() => setShowAlert(false)}
            className="shadow-lg"
          >
            <div className="d-flex align-items-center">
              <i
                className={`bi ${
                  alertVariant === "success"
                    ? "bi-check-circle-fill"
                    : alertVariant === "warning"
                    ? "bi-exclamation-triangle-fill"
                    : alertVariant === "danger"
                    ? "bi-x-circle-fill"
                    : "bi-info-circle-fill"
                } me-2`}
              ></i>
              <span className="fw-semibold">{alertMessage}</span>
            </div>
          </Alert>
        </div>
      )}

      <div className={styles.heroSection}>
        <HeroCarousel />
      </div>

      <section className={`container my-4 py-4`}>
        <div className="text-center">
          <h2 className={`mb-4`}>How would you like to enjoy our offerings?</h2>
          <div className="row justify-content-center g-3">
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                onClick={() => handleOrderTypeSelection("dine_in")}
                className={styles.optionButton}
              >
                <i className={`bi bi-shop ${styles.optionIcon}`}></i> DINE IN
              </button>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <button
                onClick={() => handleOrderTypeSelection("take_away")}
                className={styles.optionButton}
              >
                <i className={`bi bi-bag ${styles.optionIcon}`}></i> TAKEAWAY
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={`container my-4 py-3`}>
        <h2 className={`text-center mb-5 section-title`}>Combo Special</h2>

        {loading ? (
          <div className="text-center my-5">
            <div
              className="spinner-border"
              role="status"
              style={{ color: "var(--primary-color)" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading combos...</p>
          </div>
        ) : error ? (
          <LoadingError
            message={`Gagal memuat combo: ${error}`}
            onRetry={fetchFeaturedCombos}
            showHomeLink={false}
          />
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
            {featuredCombos.length > 0 ? (
              featuredCombos.map((combo) => (
                <div key={combo.product_id || combo.id} className="col">
                  <MenuItemCard
                    product={combo}
                    showAddButton={
                      isAuthenticated && user?.role === "pelanggan"
                    }
                    onAddToCart={() => handleAddToCart(combo)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-5 col-12">
                <h4>Belum ada combo yang tersedia</h4>
                <p>Silakan coba lagi nanti.</p>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center mt-4">
            <div className="alert alert-info d-inline-block">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Login</strong> untuk menambahkan combo special
              ke keranjang dan melakukan pemesanan.
            </div>
          </div>
        )}

        {isAuthenticated && user?.role !== "pelanggan" && (
          <div className="text-center mt-4">
            <div className="alert alert-warning d-inline-block">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Hanya untuk pelanggan:</strong> Fitur pemesanan hanya
              tersedia untuk akun pelanggan.
            </div>
          </div>
        )}
      </section>

      {isAuthenticated && user?.role === "pelanggan" && (
        <section className={`container my-4 py-4 bg-light rounded`}>
          <div className="text-center">
            <h4 className="mb-3">Lanjutkan ke Pemesanan</h4>
            <p className="mb-3">
              Anda sudah login. Silakan lanjutkan untuk
              melihat menu lengkap dan melakukan pemesanan.
            </p>
            <button
              onClick={() => navigate("/order")}
              className="btn btn-primary btn-lg"
            >
              <i className="bi bi-arrow-right me-2"></i>
              Lihat Menu Lengkap
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
