import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { orderService } from "../../../services/orderService";
import { helpers } from "../../../utils/helpers";
import styles from "./PaymentSuccess.module.css";

const PaymentSuccess = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentData } = location.state || {};

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Data pesanan tidak ditemukan");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const orderDetails = await orderService.getCustomerOrderById(orderId);
        setOrder(orderDetails);
      } catch (err) {
        setError(err.message || "Gagal memuat detail pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <Container className={styles.paymentSuccess}>
        <Row className="justify-content-center text-center">
          <Col md={6}>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Memuat detail pesanan...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className={styles.paymentSuccess}>
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error || "Data pesanan tidak ditemukan"}
            </Alert>
            <div className="text-center">
              <Button variant="primary" onClick={() => navigate("/orders")}>
                Lihat Pesanan Saya
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className={`mt-5 ${styles.paymentSuccess}`}>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className={styles.successCard}>
            <Card.Body className="text-center">
              <div className={styles.successIcon}>
                <i className="bi bi-check-circle"></i>
              </div>

              <h3 className={styles.successTitle}>Pembayaran Berhasil!</h3>

              <p className={styles.successMessage}>
                Terima kasih telah melakukan pembayaran. Pesanan Anda sedang
                diproses.
              </p>

              <div className={styles.orderSummary}>
                <h5>Detail Pesanan</h5>
                <div className={styles.orderInfo}>
                  <span>ID Pesanan:</span>
                  <strong>#{order.order_id}</strong>
                </div>
                <div className={styles.orderInfo}>
                  <span>Nomor Antrian:</span>
                  <strong>{order.nomor_antrian}</strong>
                </div>
                <div className={styles.orderInfo}>
                  <span>Total Pembayaran:</span>
                  <strong>{helpers.formatCurrency(order.total_harga)}</strong>
                </div>
                <div className={styles.orderInfo}>
                  <span>Status:</span>
                  <strong className={styles.statusProcessing}>Diproses</strong>
                </div>
              </div>

              <div className={`mt-4 ${styles.actionButtons}`}>
                <Button
                  variant="primary"
                  onClick={() => navigate("/orders")}
                  className={`me-2 ${styles.mainButton}`}
                >
                  <i className="bi bi-list me-2"></i>
                  Lihat Pesanan Saya
                </Button>
                <Button variant="primary" onClick={() => navigate("/")}>
                  <i className="bi bi-house me-2"></i>
                  Kembali ke Beranda
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;
