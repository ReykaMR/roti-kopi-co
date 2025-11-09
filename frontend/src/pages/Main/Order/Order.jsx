import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Button,
  Modal,
  Form,
  ListGroup,
  Alert,
  InputGroup,
} from "react-bootstrap";
import MenuItemCard from "../../../components/ui/MenuItemCard/MenuItemCard";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import { productService } from "../../../services/productService";
import {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  setOrderType,
} from "../../../store/slices/orderSlice";
import { helpers } from "../../../utils/helpers";
import styles from "./Order.module.css";

const Order = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { cart, currentOrderType } = useSelector((state) => state.orders);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts({
        page: 1,
        limit: 100,
        status: "available",
      });

      let productsData = [];

      if (response && response.data && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (response && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else {
        console.error("Format response tidak dikenali:", response);
        setError("Format data produk tidak valid");
        setProducts([]);
        return;
      }

      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.error || err.message || "Gagal memuat menu");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        product_id: product.product_id,
        nama: product.nama,
        harga: product.harga,
        gambar_url: product.gambar_url,
        quantity: 1,
      })
    );

    showNotification(
      `${product.nama} berhasil ditambahkan ke keranjang!`,
      "success"
    );
  };

  const handleRemoveFromCart = (productId) => {
    const product = cart.find((item) => item.product_id === productId);
    dispatch(removeFromCart(productId));

    if (product) {
      showNotification(`${product.nama} dihapus dari keranjang`, "warning");
    }
  };

  const handleUpdateQuantity = (productId, quantity) => {
    const product = cart.find((item) => item.product_id === productId);

    if (quantity < 1) {
      dispatch(removeFromCart(productId));
      if (product) {
        showNotification(`${product.nama} dihapus dari keranjang`, "warning");
      }
      return;
    }

    dispatch(
      updateCartItemQuantity({
        product_id: productId,
        quantity: quantity,
      })
    );

    if (product) {
      if (quantity > product.quantity) {
        showNotification(
          `Jumlah ${product.nama} ditambah menjadi ${quantity}`,
          "info"
        );
      } else {
        showNotification(
          `Jumlah ${product.nama} dikurangi menjadi ${quantity}`,
          "info"
        );
      }
    }
  };

  const handleOrderTypeChange = (type) => {
    dispatch(setOrderType(type));
    showNotification(
      `Tipe pesanan diubah menjadi ${
        type === "dine_in" ? "Dine In" : "Takeaway"
      }`,
      "info"
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + parseFloat(item.harga) * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    if (!customerName || !customerPhone) {
      setError("Nama dan nomor telepon pelanggan harus diisi");
      showNotification("Harap isi nama dan nomor telepon pelanggan", "danger");
      return;
    }

    if (cart.length === 0) {
      setError("Keranjang belanja kosong");
      showNotification("Keranjang belanja masih kosong", "danger");
      return;
    }

    const normalizePhone = (phone) => {
      const cleaned = phone.toString().replace(/\D/g, "");
      if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
      if (cleaned.startsWith("62")) return cleaned;
      if (cleaned.startsWith("8")) return "62" + cleaned;
      return cleaned;
    };

    const normalizedPhone = normalizePhone(customerPhone);

    showNotification("Memproses pesanan...", "success");

    setTimeout(() => {
      navigate("/checkout", {
        state: {
          customerName,
          customerPhone: normalizedPhone,
          orderType: currentOrderType,
          cartItems: cart,
          totalAmount: getCartTotal(),
          userId: user?.user_id,
        },
      });
    }, 1000);
  };

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
        <p className="mt-2">Memuat menu...</p>
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
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
        <Alert
          show={showAlert}
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

      <header className="container text-center my-5">
        <h1 className="section-title">Pesan Menu</h1>
        <p className="lead">
          Pilih menu favorit Anda dan tambahkan ke keranjang
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

        <div className="mb-4 text-end">
          <Button
            className={styles.button}
            onClick={() => setShowCart(true)}
            disabled={cart.length === 0}
          >
            <i className="bi bi-cart"></i> Keranjang ({cart.length}) -{" "}
            {helpers.formatCurrency(getCartTotal())}
          </Button>
        </div>

        <div className={styles.menuGrid}>
          {filteredProducts.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
              {filteredProducts.map((product) => (
                <div key={product.product_id} className="col">
                  <MenuItemCard
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
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

      <Modal show={showCart} onHide={() => setShowCart(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Keranjang Belanja</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center">
              <div className="text-center">
                <i className="bi bi-cart-x display-1 text-secondary"></i>
                <h3 className="mt-3 fw-bold">Keranjang Kosong</h3>
                <p className="text-muted">
                  Ups, sepertinya kamu belum menambahkan produk ke keranjang.
                </p>
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setShowCart(false)}
                >
                  <i className="bi bi-bag-plus me-2"></i> Belanja Sekarang
                </button>
              </div>
            </div>
          ) : (
            <>
              <ListGroup variant="flush">
                {cart.map((item) => (
                  <ListGroup.Item
                    key={item.product_id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={item.gambar_url || "https://placehold.co/50x50"}
                        alt={item.nama}
                        className="rounded me-3"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <h6 className="mb-0">{item.nama}</h6>
                        <small className="text-muted">
                          {helpers.formatCurrency(item.harga)}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.quantity - 1
                          )
                        }
                      >
                        -
                      </Button>
                      <span className="mx-2 fw-bold">{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleRemoveFromCart(item.product_id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="mt-3 p-3 bg-light rounded">
                <h5 className="mb-0">
                  Total: {helpers.formatCurrency(getCartTotal())}
                </h5>
              </div>

              <hr />

              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nama Pelanggan</Form.Label>
                      <Form.Control
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Masukkan nama pelanggan"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nomor Telepon</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>+62</InputGroup.Text>
                        <Form.Control
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            setCustomerPhone(numericValue);
                          }}
                          placeholder="81234567890"
                          maxLength={13}
                          required
                        />
                      </InputGroup>
                      {isAuthenticated && user?.nomor_telepon && (
                        <Form.Text className="text-muted">
                          Login sebagai: {user.nomor_telepon}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Tipe Pesanan</Form.Label>
                  <Form.Select
                    value={currentOrderType}
                    onChange={(e) => handleOrderTypeChange(e.target.value)}
                  >
                    <option value="dine_in">Dine In</option>
                    <option value="take_away">Takeaway</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCart(false)}>
            Tutup
          </Button>
          <Button
            className={styles.button}
            onClick={handleCheckout}
            disabled={cart.length === 0 || !customerName || !customerPhone}
          >
            <i className="bi bi-credit-card me-2"></i>
            Pesan Sekarang
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Order;
