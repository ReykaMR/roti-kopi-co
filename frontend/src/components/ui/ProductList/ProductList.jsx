import ProductCard from "../ProductCard/ProductCard";
import styles from "./ProductList.module.css";

const ProductList = ({ products, title }) => {
  if (!products || products.length === 0) {
    return (
      <section className={`container my-4 py-3 ${styles.productList}`}>
        {title && (
          <h2
            className={`text-center mb-5 section-title ${styles.sectionTitle}`}
          >
            {title}
          </h2>
        )}
        <div className="text-center">
          <p>No products available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`container my-4 py-3 ${styles.productList}`}>
      {title && (
        <h2 className={`text-center mb-5 section-title ${styles.sectionTitle}`}>
          {title}
        </h2>
      )}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
        {products.map((product) => (
          <div key={product.id} className="col">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductList;
