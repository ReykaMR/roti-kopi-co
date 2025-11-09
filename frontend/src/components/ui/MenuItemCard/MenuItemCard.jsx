import styles from "./MenuItemCard.module.css";

const MenuItemCard = ({ product, onAddToCart, showAddButton = true }) => {
  if (!product) {
    return (
      <div className={`card h-100 ${styles.menuItemCard}`}>
        <div className="card-body text-center">
          <p>Produk tidak tersedia</p>
        </div>
      </div>
    );
  }

  const discountPercent = Number(product.discount_percent) || 0;
  const isPromo = Boolean(product.is_promo && discountPercent > 0);

  const originalPrice =
    product.original_price && product.original_price > 0
      ? product.original_price
      : product.harga;

  const displayPrice = product.harga;
  const isAvailable = product.status !== "unavailable";

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Harga tidak tersedia";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`card h-100 ${styles.menuItemCard} ${
        !isAvailable ? styles.notAvailable : ""
      }`}
    >
      {isPromo ? (
        <span
          className={`badge bg-danger position-absolute top-0 end-0 m-2 ${styles.promoBadge}`}
        >
          {discountPercent}% OFF
        </span>
      ) : null}

      <img
        src={product.gambar_url || "https://placehold.co/400x300?text=No+Image"}
        alt={product.nama || "Product image"}
        className={`card-img-top ${styles.menuItemImage}`}
        onError={(e) => {
          e.target.src = "https://placehold.co/400x300?text=No+Image";
        }}
      />

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">
          {product.nama || "Nama produk tidak tersedia"}
        </h5>
        <p className="card-text flex-grow-1">
          {product.deskripsi || "Tidak ada deskripsi"}
        </p>

        <div className="mt-auto">
          {isPromo ? (
            <div className={styles.promoPrice}>
              <span
                className={`text-muted text-decoration-line-through ${styles.originalPrice}`}
              >
                {formatPrice(originalPrice)}
              </span>
              <span className={`fw-bold text-danger ${styles.discountPrice}`}>
                {formatPrice(displayPrice)}
              </span>
            </div>
          ) : (
            <p className="card-text fw-bold">{formatPrice(displayPrice)}</p>
          )}

          {isAvailable ? (
            showAddButton ? (
              <button
                className="btn btn-primary w-100 mt-2"
                onClick={onAddToCart}
              >
                <i className="bi bi-plus"></i> Tambah
              </button>
            ) : (
              <div
                className="text-center my-2 alert alert-info fw-bold fs-5 p-1"
                role="alert"
              >
                Tersedia
              </div>
            )
          ) : (
            <div
              className="text-danger mt-2 alert alert-danger fw-bold fs-5 p-1"
              role="alert"
            >
              <i className="bi bi-x-circle"></i> Tidak Tersedia
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
