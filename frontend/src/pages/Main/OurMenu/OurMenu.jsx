import { useState, useEffect } from "react";
import MenuItemCard from "../../../components/ui/MenuItemCard/MenuItemCard";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import { productService } from "../../../services/productService";
import styles from "./OurMenu.module.css";

const OurMenu = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", name: "All" },
    { id: "combo", name: "Combo" },
    { id: "coffee", name: "Coffee" },
    { id: "tea", name: "Tea-Based" },
    { id: "nonCoffee", name: "Non-Coffee" },
    { id: "bread", name: "Bread" },
    { id: "bites", name: "Bites" },
    { id: "bottled", name: "Bottled" },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAllProducts({
        page: 1,
        limit: 100,
        status: "available",
      });

      if (response.products && Array.isArray(response.products)) {
        setProducts(response.products);
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        setProducts(response.data.products);
      } else if (Array.isArray(response)) {
        setProducts(response);
      } else if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setError("Format data produk tidak valid");
        setProducts([]);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.message || "Gagal memuat menu");
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (product) =>
            product.kategori &&
            product.kategori.toLowerCase() === activeCategory.toLowerCase()
        );

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
        <p className="mt-2">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <LoadingError
        message={`Gagal memuat menu: ${error}`}
        onRetry={fetchProducts}
        showHomeLink={true}
      />
    );
  }

  return (
    <>
      <header className="container text-center my-5">
        <h1 className="section-title">Our Menu</h1>
        <p className={`lead ${styles.lead}`}>
          Discover our delicious selection of coffee, tea, and baked goods
        </p>
      </header>

      <div className="container">
        <div className={styles.categoryNavigation}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${
                activeCategory === category.id ? styles.active : ""
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className={styles.menuGrid}>
          {filteredProducts.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
              {filteredProducts.map((product) => (
                <div key={product.product_id || product.id} className="col">
                  <MenuItemCard product={product} showAddButton={false} />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="text-center py-5">
              <h4>Tidak ada produk dalam kategori "{activeCategory}"</h4>
              <p>Silakan pilih kategori lain.</p>
            </div>
          ) : (
            <div className="text-center py-5">
              <h4>Belum ada produk yang tersedia</h4>
              <p>Silakan coba lagi nanti atau hubungi administrator.</p>
              <button className="btn btn-primary" onClick={fetchProducts}>
                Coba Muat Ulang
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OurMenu;
