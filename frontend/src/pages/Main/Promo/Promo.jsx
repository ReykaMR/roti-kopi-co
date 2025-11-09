import { useState, useEffect } from "react";
import ProductList from "../../../components/ui/ProductList/ProductList";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import styles from "./Promo.module.css";
import { promoService } from "../../../services/promoService";

const Promo = () => {
  const [promoItems, setPromoItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promoService.getAllPromos();

      const transformedData = data.map((promo) => ({
        id: promo.promo_id,
        name: promo.promo_name,
        description:
          promo.promo_description || "Nikmati penawaran spesial dari kami",
        image: "https://placehold.co/400x300",
        category: "promo",
        details:
          promo.promo_description || "Nikmati penawaran spesial dari kami",
        price:
          promo.discount_value && promo.promo_type === "discount_amount"
            ? promo.discount_value
            : null,
        originalPrice: promo.min_purchase,
        discount:
          promo.discount_value && promo.promo_type === "discount_percent"
            ? promo.discount_value
            : promo.promo_type === "discount_amount" && promo.min_purchase
            ? Math.round((promo.discount_value / promo.min_purchase) * 100)
            : 0,
        validUntil: promo.valid_until,
        isAvailable: promo.availability_status === "available",
      }));

      setPromoItems(transformedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const availablePromos = promoItems.filter((promo) => promo.isAvailable);

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
        <p className="mt-2">Loading promos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <LoadingError
        message={`Gagal memuat promo: ${error}`}
        onRetry={fetchPromos}
        showHomeLink={true}
      />
    );
  }

  return (
    <div>
      <header className="container text-center my-5">
        <h1 className="section-title">Promo Spesial</h1>
        <p className={`lead ${styles.lead}`}>
          Nikmati berbagai penawaran menarik dan promo spesial dari Roti & Kopi
          Co
        </p>
      </header>

      {availablePromos.length > 0 ? (
        <ProductList products={availablePromos} />
      ) : (
        <div className="container text-center my-5">
          <p>Tidak ada promo yang tersedia saat ini.</p>
        </div>
      )}
    </div>
  );
};

export default Promo;
