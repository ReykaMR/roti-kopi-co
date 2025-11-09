import { useState, useEffect, useRef } from "react";
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
import { paymentService } from "../../../services/paymentService";
import { helpers } from "../../../utils/helpers";
import styles from "./Payment.module.css";
import qris from "../../../assets/images/qris_mega.jpg";

const Payment = () => {
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const pollingIntervalRef = useRef(null);

  const { orderId, paymentData, totalAmount, customerName, customerPhone } =
    location.state || {};

  useEffect(() => {
    if (!orderId || !paymentData) {
      navigate("/order");
      return;
    }

    startPaymentPolling();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [orderId, paymentData, navigate]);

  const startPaymentPolling = () => {
    setIsPolling(true);
    setError(null);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    checkPaymentStatus();

    pollingIntervalRef.current = setInterval(checkPaymentStatus, 5000);
  };

  const stopPaymentPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await paymentService.checkPaymentStatus(
        paymentData.payment_id
      );

      if (response.status && response.status !== paymentStatus) {
        setPaymentStatus(response.status);
      }

      if (response.status === "paid") {
        setSuccessMessage(
          "Pembayaran berhasil! Mengarahkan ke halaman konfirmasi..."
        );
        stopPaymentPolling();

        setTimeout(() => {
          navigate("/payment/success", {
            state: {
              orderId: response.order_id || orderId,
              paymentData: response,
              totalAmount: totalAmount,
              customerName: customerName,
              customerPhone: customerPhone,
            },
          });
        }, 2000);
      }
    } catch (err) {
      if (err.response?.status !== 404 || paymentStatus !== "unpaid") {
        if (err.response?.status === 403) {
          setError(
            "Anda tidak memiliki akses untuk melihat status pembayaran ini"
          );
        } else if (err.response?.status === 404) {
          setError("Data pembayaran tidak ditemukan");
        } else {
          setError(err.message || "Gagal memeriksa status pembayaran");
        }
      }
    }
  };

  const handleManualCheck = () => {
    setError(null);
    checkPaymentStatus();
  };

  const handleSimulatePayment = async () => {
    try {
      setError(null);
      const result = await paymentService.simulatePayment(
        paymentData.payment_id
      );

      setSuccessMessage(
        "Pembayaran berhasil disimulasikan! Memeriksa status..."
      );

      setTimeout(checkPaymentStatus, 1000);
    } catch (err) {
      setError(err.message || "Gagal mensimulasikan pembayaran");
    }
  };

  if (!orderId || !paymentData) {
    return (
      <Container className={styles.paymentPage}>
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <div className={styles.errorState}>
              <i
                className="bi bi-exclamation-circle"
                style={{ fontSize: "3rem" }}
              ></i>
              <h3>Data pembayaran tidak ditemukan</h3>
              <Button variant="primary" onClick={() => navigate("/order")}>
                Kembali ke Order
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className={styles.paymentPage}>
      <Row className="justify-content-center mt-5">
        <Col md={8} lg={6}>
          <Card className={styles.paymentCard}>
            <Card.Header className="text-center">
              <h4 className="mb-0">Pembayaran QRIS</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError(null)}
                  dismissible
                >
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert
                  variant="success"
                  onClose={() => setSuccessMessage("")}
                  dismissible
                >
                  {successMessage}
                </Alert>
              )}

              <div className="text-center mb-4">
                <h5>Total Pembayaran</h5>
                <h3 className={styles.amount}>
                  {helpers.formatCurrency(totalAmount)}
                </h3>
                <small className="text-muted">
                  Order ID: #{orderId} | Payment ID: {paymentData.payment_id}
                </small>
              </div>

              <div className="text-center mb-4">
                <Alert
                  variant={
                    paymentStatus === "paid"
                      ? "success"
                      : paymentStatus === "processing"
                      ? "info"
                      : "warning"
                  }
                  className={styles.statusAlert}
                >
                  <strong>
                    {paymentStatus === "paid"
                      ? "Pembayaran Berhasil"
                      : paymentStatus === "processing"
                      ? "Pembayaran Diproses"
                      : "Menunggu Pembayaran"}
                  </strong>
                  {isPolling && paymentStatus === "unpaid" && (
                    <span className="ms-2">
                      <Spinner animation="border" size="sm" />
                      <small className="ms-1">Memantau status...</small>
                    </span>
                  )}
                </Alert>
              </div>

              <div className={styles.qrSection}>
                <h6 className="text-center mb-3">
                  Scan QR Code untuk Pembayaran
                </h6>
                <div className={styles.qrContainer}>
                  <img
                    src={qris}
                    alt="QR Code Pembayaran"
                    className={styles.qrImage}
                  />
                </div>
                <p className={styles.qrInstruction}>
                  Buka aplikasi e-wallet atau mobile banking Anda, pilih fitur
                  scan QR, dan arahkan kamera ke kode di atas.
                </p>
              </div>

              <div className={styles.paymentInfo}>
                <h6 className="mb-3">Informasi Pembayaran</h6>
                <div className={styles.infoItem}>
                  <span>Status:</span>
                  <span
                    className={
                      paymentStatus === "paid"
                        ? "text-success fw-bold"
                        : paymentStatus === "processing"
                        ? "text-info fw-bold"
                        : "text-warning fw-bold"
                    }
                  >
                    {paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span>Metode Pembayaran:</span>
                  <span>QRIS</span>
                </div>
                {paymentData.expires_at && (
                  <div className={styles.infoItem}>
                    <span>Kadaluarsa:</span>
                    <span>
                      {new Date(paymentData.expires_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <div className="mb-3">
                  <Button
                    variant="outline-primary"
                    onClick={handleManualCheck}
                    disabled={isPolling}
                    className="me-2"
                  >
                    <i className="bi bi-arrow-clockwise"></i> Periksa Status
                  </Button>

                  {/* Tombol simulasi untuk development */}
                  {/* {process.env.NODE_ENV === "development" && (
                    <Button
                      variant="outline-success"
                      onClick={handleSimulatePayment}
                      className="me-2"
                    >
                      <i className="bi bi-lightning"></i> Simulate Payment
                    </Button>
                  )} */}
                </div>

                <Button variant="primary" onClick={() => navigate("/orders")}>
                  <i className="bi bi-list-ul"></i> Lihat Pesanan Saya
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Payment;
