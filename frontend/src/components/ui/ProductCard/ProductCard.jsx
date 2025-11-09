import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product }) => {
  const isPromo = product.category === "promo";

  const isAvailable = product.isAvailable !== false;

  const formatPrice = (price) => {
    if (!price) return "Harga bervariasi";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`${isPromo ? styles.promoCard : styles.productCard} ${
        !isAvailable ? styles.notAvailable : ""
      }`}
    >
      {isPromo && product.discount > 0 && (
        <span className={styles.promoBadge}>{product.discount}% OFF</span>
      )}

      <Link
        to={isPromo ? `/promo/${product.id}` : `/menu/${product.id}`}
        className={styles.productLink}
      >
        <img
          src={product.image || "https://placehold.co/300x200"}
          alt={product.name}
          className={isPromo ? styles.promoImage : styles.productImage}
          onError={(e) => {
            e.target.src = "https://placehold.co/300x200";
          }}
        />

        <div className={isPromo ? styles.promoOverlay : styles.productOverlay}>
          <h5 className={isPromo ? styles.promoTitle : styles.productTitle}>
            {product.name}
          </h5>

          <p
            className={
              isPromo ? styles.promoDescription : styles.productDescription
            }
          >
            {product.description}
          </p>

          {isPromo && product.originalPrice && product.price && (
            <div className={styles.promoPrice}>
              <span className={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </span>
              <span className={styles.discountPrice}>
                {formatPrice(product.price)}
              </span>
            </div>
          )}

          {!isAvailable && (
            <div className={styles.notAvailableOverlay}>
              <i className="bi bi-x-circle"></i> Not Available
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
