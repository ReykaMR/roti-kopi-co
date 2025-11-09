import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { clearCart } from "../../../store/slices/orderSlice";
import { useDispatch } from "react-redux";
import styles from "./OrderSuccess.module.css";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderId, nomorAntrian, total } = location.state || {};

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  if (!orderId) {
    return (
      <Container className={styles.successPage}>
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <div className={styles.errorState}>
              <i
                className="bi bi-exclamation-circle"
                style={{ fontSize: "3rem" }}
              ></i>
              <h3>Data pesanan tidak ditemukan</h3>
              <Button variant="primary" onClick={() => navigate("/")}>
                Kembali ke Beranda
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className={styles.successPage}>
      <Row className="justify-content-center">
        <Col md={6}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h2>Pesanan Berhasil!</h2>
            <p>Terima kasih telah memesan di Roti & Kopi Co</p>

            <Card className="mt-4">
              <Card.Body>
                <div className={styles.orderDetails}>
                  <div className={styles.detailItem}>
                    <span>Nomor Pesanan:</span>
                    <strong>#{orderId}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Nomor Antrian:</span>
                    <strong>{nomorAntrian}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Total Pembayaran:</span>
                    <strong>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(total)}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={() => navigate("/")}
                className={styles.actionButton}
              >
                Kembali ke Beranda
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => navigate("/order")}
                className={styles.actionButton}
              >
                Pesan Lagi
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccess;
