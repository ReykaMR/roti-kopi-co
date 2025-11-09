import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import NotFoundError from "../../../components/common/ErrorDisplay/NotFoundError";
import styles from "./PromoDetail.module.css";
import { promoService } from "../../../services/promoService";

const PromoDetail = () => {
  const { id } = useParams();
  const [promoItem, setPromoItem] = useState(null);
  const [promoProducts, setPromoProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPromoData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promoData = await promoService.getPromoById(id);

      if (promoData) {
        const generateDescription = (promo) => {
          switch (promo.promo_type) {
            case "discount_percent":
              return `Dapatkan diskon ${promo.discount_value}% untuk pembelian tertentu`;
            case "discount_amount":
              return `Dapatkan potongan Rp ${promo.discount_value} untuk pembelian tertentu`;
            case "bundle":
              return "Paket spesial dengan penawaran menarik";
            case "combo":
              return "Paket kombo dengan harga khusus";
            default:
              return "Nikmati penawaran spesial dari kami";
          }
        };

        const transformedData = {
          id: promoData.promo_id,
          name: promoData.promo_name,
          description: generateDescription(promoData),
          image: "https://placehold.co/600x400",
          category: "promo",
          details:
            promoData.promo_description ||
            "Nikmati penawaran spesial dari kami",
          price:
            promoData.discount_value &&
            promoData.promo_type === "discount_amount"
              ? promoData.discount_value
              : null,
          originalPrice: promoData.min_purchase,
          discount:
            promoData.discount_value &&
            promoData.promo_type === "discount_percent"
              ? promoData.discount_value
              : promoData.promo_type === "discount_amount" &&
                promoData.min_purchase
              ? Math.round(
                  (promoData.discount_value / promoData.min_purchase) * 100
                )
              : 0,
          validUntil: promoData.valid_until,
          terms: [
            promoData.min_purchase
              ? `Minimum pembelian: Rp ${promoData.min_purchase.toLocaleString(
                  "id-ID"
                )}`
              : null,
            `Berlaku hingga: ${new Date(
              promoData.valid_until
            ).toLocaleDateString("id-ID")}`,
            `Tipe promo: ${promoData.promo_type}`,
            "Syarat dan ketentuan berlaku",
          ].filter((term) => term !== null),
          isAvailable: promoData.availability_status === "available",
        };

        setPromoItem(transformedData);

        const productsData = await promoService.getPromoProducts(id);
        setPromoProducts(productsData);
      } else {
        setError("Promo tidak ditemukan");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoData();
  }, [id]);

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
        <p className="mt-2">Loading promo details...</p>
      </div>
    );
  }

  if (error) {
    if (error === "Promo tidak ditemukan") {
      return (
        <NotFoundError
          message="Promo yang Anda cari tidak ditemukan."
          showHomeLink={true}
        />
      );
    }

    return (
      <LoadingError
        message={`Gagal memuat detail promo: ${error}`}
        onRetry={fetchPromoData}
        showHomeLink={true}
      />
    );
  }

  if (!promoItem) {
    return (
      <NotFoundError message="Promo tidak ditemukan." showHomeLink={true} />
    );
  }

  const formatPrice = (price) => {
    if (!price) return "Harga bervariasi";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={styles.promoDetailContainer}>
      <div className="container">
        <Link to="/promo" className={styles.backButton}>
          <i className="bi bi-arrow-left"></i> Back to Promo
        </Link>

        <div className="row">
          <div className="col-md-6 mb-3">
            <div className={styles.promoImageContainer}>
              <img
                src={promoItem.image}
                alt={promoItem.name}
                className={styles.promoImage}
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x400";
                }}
              />
              <div className={styles.discountBadge}>
                {promoItem.discount > 0
                  ? `${promoItem.discount}% OFF`
                  : "PROMO"}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <h1 className={styles.promoTitle}>{promoItem.name}</h1>
            <p className={styles.promoDescription}>{promoItem.description}</p>

            <div className={styles.validity}>
              <i className="bi bi-calendar-check"></i>
              <span>
                Berlaku hingga:{" "}
                {new Date(promoItem.validUntil).toLocaleDateString("id-ID")}
              </span>
            </div>

            {promoItem.originalPrice && (
              <div className={styles.minPurchase}>
                <i className="bi bi-info-circle"></i>
                <span>
                  Minimum pembelian: {formatPrice(promoItem.originalPrice)}
                </span>
              </div>
            )}

            <div className={styles.promoDetails}>
              <h3>Detail Promo</h3>
              <p>{promoItem.details}</p>
            </div>

            {/* {promoProducts.length > 0 && (
              <div className={styles.promoProducts}>
                <h3>Produk dalam Promo</h3>
                <div className="row">
                  {promoProducts.map((product) => (
                    <div
                      key={product.product_id}
                      className="col-6 col-md-4 mb-2"
                    >
                      <div className={styles.productItem}>
                        <img
                          src={
                            product.gambar_url || "https://placehold.co/100x100"
                          }
                          alt={product.nama}
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100";
                          }}
                        />
                        <p>{product.nama}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.availability}>
              {promoItem.isAvailable ? (
                <span className={styles.available}>
                  <i className="bi bi-check-circle"></i> Promo Tersedia
                </span>
              ) : (
                <span className={styles.unavailable}>
                  <i className="bi bi-x-circle"></i> Promo Tidak Tersedia
                </span>
              )}
            </div>

            <div className={styles.termsConditions}>
              <h3>Syarat & Ketentuan</h3>
              <ul>
                {promoItem.terms.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </div> */}

            <div className={styles.actionButtons}>
              <a href="/login" className={`text-decoration-none ${styles.usePromoButton}`}>
                <i className="bi bi-cart-plus"></i> Gunakan Promo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoDetail;
