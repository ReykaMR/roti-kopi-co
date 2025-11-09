import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  ListGroup,
  Spinner,
  Badge,
} from "react-bootstrap";
import { createOrder } from "../../../store/slices/orderSlice";
import { paymentService } from "../../../services/paymentService";
import { helpers } from "../../../utils/helpers";
import styles from "./Checkout.module.css";

const Checkout = () => {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.orders);

  const { customerName, customerPhone, orderType, cartItems, totalAmount } =
    location.state || {};

  useEffect(() => {
    if (
      !customerName ||
      !customerPhone ||
      !cartItems ||
      cartItems.length === 0 ||
      !orderType ||
      !totalAmount ||
      totalAmount <= 0
    ) {
      navigate("/order", { replace: true });
      return;
    }

    if (isAuthenticated && user) {
      const normalizePhone = (phone) => {
        const cleaned = phone.toString().replace(/\D/g, "");
        if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
        if (cleaned.startsWith("62")) return cleaned;
        return "62" + cleaned;
      };

      const currentUserPhone = normalizePhone(user.nomor_telepon || "");
      const inputPhone = normalizePhone(customerPhone);

      if (currentUserPhone !== inputPhone) {
        setError("Nomor telepon tidak sesuai dengan akun yang login");
      }
    }
  }, [
    customerName,
    customerPhone,
    cartItems,
    orderType,
    totalAmount,
    navigate,
    user,
    isAuthenticated,
  ]);

  const validateOrderData = () => {
    const errors = {};

    if (!customerName?.trim()) {
      errors.customerName = "Nama pelanggan harus diisi";
    }

    if (!customerPhone?.trim()) {
      errors.customerPhone = "Nomor telepon harus diisi";
    } else if (!/^[0-9]{9,15}$/.test(customerPhone.replace(/\D/g, ""))) {
      errors.customerPhone = "Format nomor telepon tidak valid";
    }

    if (!cartItems || cartItems.length === 0) {
      errors.cart = "Keranjang belanja kosong";
    }

    if (!totalAmount || totalAmount <= 0) {
      errors.amount = "Total pembayaran tidak valid";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmOrder = async () => {
    if (!validateOrderData()) {
      setError("Data tidak valid. Silakan periksa kembali.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.replace(/\D/g, ""),
        tipe_pesanan: orderType,
        notes: notes.trim(),
        items: cartItems.map((item) => ({
          product_id: parseInt(item.product_id),
          jumlah: parseInt(item.quantity),
          harga_satuan: parseFloat(item.harga),
        })),
      };

      const response = await dispatch(createOrder(orderData)).unwrap();

      if (!response.order_id) {
        throw new Error("Order ID tidak diterima dari server");
      }

      const paymentResponse = await paymentService.generateQRIS(
        response.order_id,
        totalAmount
      );

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || "Gagal menghasilkan QRIS");
      }

      navigate("/payment", {
        state: {
          orderId: response.order_id,
          paymentData: paymentResponse,
          totalAmount: totalAmount,
          customerName: customerName,
          customerPhone: customerPhone,
          nomorAntrian: response.nomor_antrian,
          orderType: orderType,
        },
        replace: true,
      });
    } catch (err) {
      // console.error("Checkout error:", err);

      let errorMessage = "Terjadi kesalahan saat memproses pesanan";

      if (err?.code === "ERR_NETWORK") {
        errorMessage =
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customerName || !customerPhone || !cartItems || !totalAmount) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Card>
              <Card.Body>
                <i className="bi bi-exclamation-circle display-1 text-warning"></i>
                <h3 className="mt-3">Data Tidak Lengkap</h3>
                <p className="text-muted">
                  Silakan kembali ke halaman order untuk melengkapi data pesanan
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/order")}
                  className="mt-3"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Kembali ke Order
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h1 className="mb-4 text-center">Checkout</h1>

          {error && (
            <Alert
              variant="danger"
              onClose={() => setError(null)}
              dismissible
              className="mb-4"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <Row>
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Informasi Pelanggan</h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Nama Pelanggan</strong>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={customerName}
                            readOnly
                            className={
                              validationErrors.customerName ? "is-invalid" : ""
                            }
                          />
                          {validationErrors.customerName && (
                            <div className="invalid-feedback">
                              {validationErrors.customerName}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <strong>Nomor Telepon</strong>
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            value={customerPhone}
                            readOnly
                            className={
                              validationErrors.customerPhone ? "is-invalid" : ""
                            }
                          />
                          {validationErrors.customerPhone && (
                            <div className="invalid-feedback">
                              {validationErrors.customerPhone}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Catatan Pesanan (Opsional)</strong>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Tidak pakai gula, packing rapi, tambah es, dll."
                        maxLength={500}
                      />
                      <Form.Text className="text-muted">
                        Maksimal 500 karakter
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Tipe Pesanan</strong>
                      </Form.Label>
                      <div>
                        <Badge
                          bg={orderType === "dine_in" ? "primary" : "secondary"}
                          className="fs-6"
                        >
                          {orderType === "dine_in" ? "Dine In" : "Takeaway"}
                        </Badge>
                      </div>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Ringkasan Pembayaran</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <span>{helpers.formatCurrency(totalAmount)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Pajak (0%):</span>
                      <span>{helpers.formatCurrency(0)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Biaya Layanan:</span>
                      <span>{helpers.formatCurrency(0)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between fs-5 fw-bold">
                      <span>Total:</span>
                      <span>
                        {helpers.formatCurrency(totalAmount)}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 mb-2"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-qr-code me-2"></i>
                        Bayar dengan QRIS
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => navigate("/order")}
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Kembali ke Order
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Order Details */}
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Detail Pesanan</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {cartItems.map((item, index) => (
                  <ListGroup.Item
                    key={`${item.product_id}-${index}`}
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
                        <h6 className="mb-1">{item.nama}</h6>
                        <small className="text-muted">
                          {helpers.formatCurrency(item.harga)} × {item.quantity}
                        </small>
                      </div>
                    </div>
                    <span className="fw-bold">
                      {helpers.formatCurrency(item.harga * item.quantity)}
                    </span>
                  </ListGroup.Item>
                ))}

                <ListGroup.Item className="d-flex justify-content-between align-items-center fw-bold fs-5">
                  <span>Total</span>
                  <span>
                    {helpers.formatCurrency(totalAmount)}
                  </span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
