import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { orderService } from "../../services/orderService";
import { paymentService } from "../../services/paymentService";
import { helpers } from "../../utils/helpers";
import LoadingError from "../../components/common/ErrorDisplay/LoadingError";
import styles from "./KasirDashboard.module.css";

const KasirDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentData, setPaymentData] = useState(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getAllOrders({
        limit: 100,
      });

      let ordersData = [];
      if (response.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (response.data && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else {
        throw new Error("Format data pesanan tidak valid");
      }

      const ordersWithPayments = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const paymentResponse =
              await paymentService.getPaymentStatusByOrderId(order.order_id);
            return {
              ...order,
              payment_status: paymentResponse.status || "unpaid",
              payment_data: paymentResponse,
              payment_id: paymentResponse.payment_id,
            };
          } catch (error) {
            return {
              ...order,
              payment_status: "unpaid",
              payment_data: null,
              payment_id: null,
            };
          }
        })
      );

      setAllOrders(ordersWithPayments);
      setOrders(ordersWithPayments);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Gagal memuat data pesanan"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = allOrders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" &&
        (order.status === "pending" || order.status === "processing")) ||
      order.status === filterStatus;

    const matchesSearch =
      searchTerm === "" ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.nomor_antrian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginationItems = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationItems.push(
      <Pagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => setCurrentPage(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  const handleViewOrder = async (order) => {
    try {
      setError(null);
      const orderDetail = await orderService.getOrderById(order.order_id);
      setSelectedOrder(orderDetail);

      try {
        const paymentResponse = await paymentService.getPaymentStatusByOrderId(
          order.order_id
        );
        setPaymentData(paymentResponse);
      } catch (error) {
        setPaymentData(null);
      }

      setShowOrderModal(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Gagal memuat detail pesanan"
      );
    }
  };

  const handleUpdatePaymentStatus = async (newStatus) => {
    if (!paymentData?.payment_id) {
      setError("Data pembayaran tidak ditemukan");
      return;
    }

    try {
      setUpdatingPayment(true);
      setError(null);

      const result = await paymentService.updatePaymentStatus(
        paymentData.payment_id,
        newStatus
      );

      setSuccessMessage(
        `Status pembayaran berhasil diubah menjadi ${getPaymentStatusText(
          newStatus
        )}`
      );

      setPaymentData(result.payment);
      setTimeout(() => {
        fetchOrders();
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Gagal mengupdate status pembayaran");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, {
        status: newStatus,
        notes: "Status diubah oleh kasir",
      });
      setShowOrderModal(false);
      setSuccessMessage(
        `Status pesanan berhasil diubah menjadi ${getStatusText(newStatus)}`
      );
      fetchOrders();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Gagal mengupdate status pesanan"
      );
    }
  };

  const handleProcessPayment = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, {
        status: "completed",
        notes: `Pembayaran dengan ${paymentMethod} telah diproses`,
      });
      setShowOrderModal(false);
      setSuccessMessage("Pesanan berhasil diselesaikan!");
      fetchOrders();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Gagal memproses pembayaran"
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "warning", text: "Pending", icon: "bi-clock" },
      processing: { bg: "info", text: "Processing", icon: "bi-arrow-repeat" },
      completed: { bg: "success", text: "Completed", icon: "bi-check-circle" },
      cancelled: { bg: "danger", text: "Cancelled", icon: "bi-x-circle" },
    };

    const config = statusConfig[status] || {
      bg: "secondary",
      text: status,
      icon: "bi-question",
    };
    return (
      <Badge
        bg={config.bg}
        className="d-flex align-items-center gap-1 justify-content-center"
        style={{ width: "fit-content", margin: "0 auto" }}
      >
        <i className={`bi ${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: "success", text: "Paid", icon: "bi-check-circle" },
      unpaid: { bg: "warning", text: "Unpaid", icon: "bi-clock" },
      cancelled: { bg: "danger", text: "Cancelled", icon: "bi-x-circle" },
    };

    const config = statusConfig[status] || {
      bg: "secondary",
      text: status,
      icon: "bi-question",
    };
    return (
      <Badge
        bg={config.bg}
        className="d-flex align-items-center gap-1 justify-content-center"
        style={{ width: "fit-content", margin: "0 auto" }}
      >
        <i className={`bi ${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      paid: "Paid",
      unpaid: "Unpaid",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getOrderTypeBadge = (type) => {
    return type === "dine_in" ? (
      <Badge bg="primary" className="d-flex justify-content-center">
        <i className="bi bi-shop me-1"></i> Dine In
      </Badge>
    ) : (
      <Badge bg="secondary" className="d-flex justify-content-center">
        <i className="bi bi-bag me-1"></i> Takeaway
      </Badge>
    );
  };

  const stats = {
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((order) => order.status === "pending")
      .length,
    processingOrders: allOrders.filter((order) => order.status === "processing")
      .length,
    paidPayments: allOrders.filter((order) => order.payment_status === "paid")
      .length,
    unpaidPayments: allOrders.filter(
      (order) => order.payment_status === "unpaid"
    ).length,
    revenue: allOrders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + parseFloat(order.total_harga || 0), 0),
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data pesanan...</p>
      </div>
    );
  }

  if (error && allOrders.length === 0) {
    return (
      <LoadingError
        message={`Gagal memuat data: ${error}`}
        onRetry={fetchOrders}
        showHomeLink={false}
      />
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Dashboard Kasir</h1>
          <p className="text-muted mb-0">
            Kelola pesanan dan status pembayaran pelanggan
          </p>
        </div>
        <Button variant="primary" onClick={fetchOrders} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-2"></i> Refresh
        </Button>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          className="mb-4"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          <i className="bi bi-check-circle me-2"></i>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          className="mb-4"
          dismissible
          onClose={() => setError(null)}
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className={styles.statCard}>
            <Card.Body className="text-center">
              <div className={styles.statIcon}>
                <i className="bi bi-cart"></i>
              </div>
              <Card.Title className={styles.statTitle}>
                Total Pesanan
              </Card.Title>
              <Card.Text className={styles.statNumber}>
                {stats.totalOrders}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className={styles.statCard}>
            <Card.Body className="text-center">
              <div className={styles.statIcon}>
                <i className="bi bi-clock"></i>
              </div>
              <Card.Title className={styles.statTitle}>Menunggu</Card.Title>
              <Card.Text className={styles.statNumber}>
                {stats.pendingOrders}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className={styles.statCard}>
            <Card.Body className="text-center">
              <div className={styles.statIcon}>
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <Card.Title className={styles.statTitle}>Diproses</Card.Title>
              <Card.Text className={styles.statNumber}>
                {stats.processingOrders}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className={styles.statCard}>
            <Card.Body className="text-center">
              <div className={styles.statIcon}>
                <i className="bi bi-currency-dollar"></i>
              </div>
              <Card.Title className={styles.statTitle}>Lunas</Card.Title>
              <Card.Text className={styles.statNumber}>
                {stats.paidPayments}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className={styles.statCard}>
            <Card.Body className="text-center">
              <div className={styles.statIcon}>
                <i className="bi bi-clock-history"></i>
              </div>
              <Card.Title className={styles.statTitle}>Belum Bayar</Card.Title>
              <Card.Text className={styles.statNumber}>
                {stats.unpaidPayments}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={2} lg={4} md={6} className="mb-3">
          <Card className={styles.statCard}>
            <Card.Body className="text-center">
              <div className={styles.statIcon}>
                <i className="bi bi-graph-up"></i>
              </div>
              <Card.Title className={styles.statTitle}>Pendapatan</Card.Title>
              <Card.Text className={styles.statNumber}>
                {helpers.formatCurrency(stats.revenue)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Cari Pesanan</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Cari nama pelanggan, nomor antrian..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Label>Status Pesanan</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active (Pending + Processing)</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <div className="d-grid">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reset Filter
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Daftar Pesanan ({filteredOrders.length})</h5>
          <Badge bg="light" text="dark">
            Total: {stats.totalOrders} pesanan
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredOrders.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table className="mb-0 align-middle text-center">
                  <thead className="table-light align-middle">
                    <tr>
                      <th width="80">ID</th>
                      <th>Pelanggan</th>
                      <th width="120">Telepon</th>
                      <th width="120">Antrian</th>
                      <th width="100">Tipe</th>
                      <th width="120">Total</th>
                      <th width="140">Status Pesanan</th>
                      <th width="140">Status Pembayaran</th>
                      <th width="100">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr
                        key={order.order_id}
                        className={
                          order.status === "pending" ? "table-warning" : ""
                        }
                      >
                        <td className="fw-bold">#{order.order_id}</td>
                        <td>
                          <div className="fw-semibold">
                            {order.customer_name}
                          </div>
                          <small className="text-muted">
                            {new Date(order.waktu_pesan).toLocaleTimeString(
                              "id-ID"
                            )}
                          </small>
                        </td>
                        <td>{order.customer_phone || "-"}</td>
                        <td>
                          <Badge bg="light" text="dark" className="border">
                            {order.nomor_antrian}
                          </Badge>
                        </td>
                        <td>{getOrderTypeBadge(order.tipe_pesanan)}</td>
                        <td className="fw-bold">
                          {helpers.formatCurrency(order.total_harga)}
                        </td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>{getPaymentStatusBadge(order.payment_status)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            title="Lihat detail dan kelola pembayaran"
                          >
                            <i className="bi bi-gear me-1"></i> Kelola
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <div className="text-muted">
                  Menampilkan {indexOfFirstItem + 1} -{" "}
                  {Math.min(indexOfLastItem, filteredOrders.length)} dari{" "}
                  {filteredOrders.length} pesanan
                </div>

                {totalPages > 1 && (
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </Pagination.Prev>

                    {startPage > 1 && (
                      <>
                        <Pagination.Item onClick={() => setCurrentPage(1)}>
                          1
                        </Pagination.Item>
                        {startPage > 2 && <Pagination.Ellipsis />}
                      </>
                    )}

                    {paginationItems}

                    {endPage < totalPages && (
                      <>
                        {endPage < totalPages - 1 && <Pagination.Ellipsis />}
                        <Pagination.Item
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Pagination.Item>
                      </>
                    )}

                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </Pagination.Next>
                  </Pagination>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h5 className="mt-3">Tidak ada pesanan ditemukan</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== "all"
                  ? "Coba ubah kata kunci pencarian atau filter yang dipilih"
                  : "Belum ada pesanan yang tercatat dalam sistem"}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-receipt me-2"></i>
            Detail Pesanan #{selectedOrder?.order_id}
            {updatingPayment && (
              <Spinner animation="border" size="sm" className="ms-2" />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Informasi Pesanan
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Pelanggan:</strong>{" "}
                        {selectedOrder.customer_name}
                      </div>
                      <div className="mb-2">
                        <strong>Telepon:</strong>{" "}
                        {selectedOrder.customer_phone || "-"}
                      </div>
                      <div className="mb-2">
                        <strong>Antrian:</strong>
                        <Badge bg="light" text="dark" className="ms-2">
                          {selectedOrder.nomor_antrian}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <strong>Tipe Pesanan:</strong>{" "}
                        <Badge className="ms-2">
                          {getOrderTypeBadge(selectedOrder.tipe_pesanan)}
                        </Badge>
                      </div>
                      <div>
                        <strong>Waktu Pesan:</strong>{" "}
                        {new Date(selectedOrder.waktu_pesan).toLocaleString(
                          "id-ID"
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">
                        <i className="bi bi-currency-dollar me-2"></i>
                        Status Pembayaran
                      </h6>
                    </Card.Header>
                    <Card.Body className="text-center">
                      <div className="mb-3">
                        {getPaymentStatusBadge(paymentData?.status || "unpaid")}
                      </div>
                      <div className="display-6 fw-bold">
                        {helpers.formatCurrency(selectedOrder.total_harga)}
                      </div>
                      {paymentData?.payment_id && (
                        <small className="text-muted">
                          Payment ID: {paymentData.payment_id}
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="bi bi-credit-card me-2"></i>
                    Kelola Status Pembayaran
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2 d-md-flex justify-content-center">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => handleUpdatePaymentStatus("paid")}
                      disabled={
                        updatingPayment || paymentData?.status === "paid"
                      }
                      className="px-4"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Tandai Sudah Bayar
                    </Button>
                    <Button
                      variant="warning"
                      size="lg"
                      onClick={() => handleUpdatePaymentStatus("unpaid")}
                      disabled={
                        updatingPayment || paymentData?.status === "unpaid"
                      }
                      className="px-4"
                    >
                      <i className="bi bi-clock me-2"></i>
                      Tandai Belum Bayar
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => handleUpdatePaymentStatus("cancelled")}
                      disabled={
                        updatingPayment || paymentData?.status === "cancelled"
                      }
                      className="px-4"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Batalkan Pembayaran
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Status saat ini:{" "}
                      {getPaymentStatusText(paymentData?.status || "unpaid")}
                    </small>
                  </div>
                </Card.Body>
              </Card>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-list me-2"></i>
                      Items Pesanan ({selectedOrder.items.length})
                    </h6>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Produk</th>
                          <th width="100" className="text-center">
                            Jumlah
                          </th>
                          <th width="150" className="text-end">
                            Harga Satuan
                          </th>
                          <th width="150" className="text-end">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={item.detail_id || index}>
                            <td>
                              <div className="fw-semibold">
                                {item.product_name}
                              </div>
                              {item.nama && item.nama !== item.product_name && (
                                <small className="text-muted">
                                  {item.nama}
                                </small>
                              )}
                            </td>
                            <td className="text-center">{item.jumlah}x</td>
                            <td className="text-end">
                              {helpers.formatCurrency(item.harga_satuan)}
                            </td>
                            <td className="text-end fw-bold">
                              {helpers.formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan={3} className="text-end fw-bold">
                            Total:
                          </td>
                          <td className="text-end fw-bold fs-5">
                            {helpers.formatCurrency(selectedOrder.total_harga)}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {selectedOrder.status === "pending" && (
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-play-circle me-2"></i>
                      Proses Pesanan
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2 d-md-flex">
                      <Button
                        variant="success"
                        size="lg"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            selectedOrder.order_id,
                            "processing"
                          )
                        }
                      >
                        <i className="bi bi-play-circle me-2"></i> Mulai Proses
                        Pesanan
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {selectedOrder.status === "processing" && (
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="bi bi-check-circle me-2"></i>
                      Selesaikan Pesanan
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Metode Pembayaran</Form.Label>
                          <Form.Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option value="qris">QRIS</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <div className="d-grid h-100">
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() =>
                              handleProcessPayment(selectedOrder.order_id)
                            }
                            disabled={paymentData?.status !== "paid"}
                            className=""
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Selesaikan Pesanan
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    {paymentData?.status !== "paid" && (
                      <Alert variant="warning" className="mt-3">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Pembayaran harus dilunasi terlebih dahulu sebelum
                        menyelesaikan pesanan.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Tutup
          </Button>
          <Button variant="primary" onClick={fetchOrders}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh Data
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default KasirDashboard;
