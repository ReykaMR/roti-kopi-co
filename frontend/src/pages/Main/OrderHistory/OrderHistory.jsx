import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Alert,
  Modal,
  ButtonGroup,
} from "react-bootstrap";
import { customerService } from "../../../services/customerService";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import styles from "./OrderHistory.module.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerService.getOrderHistory({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
      });

      if (response.orders && response.orders.length > 0) {
        setOrders(response.orders);
        setPagination(
          response.pagination || {
            page: currentPage,
            limit: itemsPerPage,
            total: response.orders.length,
            pages: Math.ceil(response.orders.length / itemsPerPage),
          }
        );
      } else {
        setOrders([]);
        setPagination({
          page: 1,
          limit: itemsPerPage,
          total: 0,
          pages: 0,
        });
      }
    } catch (err) {
      const errorMsg = err.message || "Gagal memuat riwayat pesanan";
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "warning", text: "Pending" },
      processing: { variant: "info", text: "Processing" },
      completed: { variant: "success", text: "Completed" },
      cancelled: { variant: "danger", text: "Cancelled" },
      paid: { variant: "primary", text: "Paid" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: status,
    };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleOrderClick = async (orderId) => {
    try {
      const orderDetail = await customerService.getOrderDetail(orderId);
      setSelectedOrder(orderDetail);
    } catch (err) {
      setError("Gagal memuat detail pesanan");
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxPages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.pages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Button
          key={page}
          variant={pagination.page === page ? "primary" : "outline-primary"}
          size="sm"
          onClick={() => setCurrentPage(page)}
          className="mx-1"
        >
          {page}
        </Button>
      );
    }

    return items;
  };

  if (loading) {
    return (
      <Container className="my-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat riwayat pesanan...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="py-4">
              <Row className="align-items-center">
                <Col md={6}>
                  <h1 className="h3 mb-2 fw-bold text-danger-emphasis">
                    Riwayat Pesanan
                  </h1>
                  <p className="text-muted mb-0">
                    Lihat semua pesanan yang pernah Anda buat
                  </p>
                </Col>
                <Col md={6} className="text-md-end">
                  <p className="mb-1">
                    <strong>Pelanggan:</strong> {user?.nama || "Guest"}
                  </p>
                  <p className="mb-0 text-muted small">{user?.nomor_telepon}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {error ? (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Terjadi Kesalahan</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" size="sm" onClick={fetchOrders}>
                Coba Lagi
              </Button>
            </Alert>
          ) : (
            <>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={6}>
                      <Form.Label className="fw-medium mb-2 me-2">
                        Filter Status:
                      </Form.Label>
                      <ButtonGroup size="sm" className="flex-wrap">
                        <Button
                          variant={
                            statusFilter === ""
                              ? "primary"
                              : "outline-secondary"
                          }
                          onClick={() => handleStatusFilterChange("")}
                        >
                          All
                        </Button>
                        <Button
                          variant={
                            statusFilter === "pending"
                              ? "primary"
                              : "outline-secondary"
                          }
                          onClick={() => handleStatusFilterChange("pending")}
                        >
                          Pending
                        </Button>
                        <Button
                          variant={
                            statusFilter === "processing"
                              ? "primary"
                              : "outline-secondary"
                          }
                          onClick={() => handleStatusFilterChange("processing")}
                        >
                          Processing
                        </Button>
                        <Button
                          variant={
                            statusFilter === "completed"
                              ? "primary"
                              : "outline-secondary"
                          }
                          onClick={() => handleStatusFilterChange("completed")}
                        >
                          Completed
                        </Button>
                        <Button
                          variant={
                            statusFilter === "cancelled"
                              ? "primary"
                              : "outline-secondary"
                          }
                          onClick={() => handleStatusFilterChange("cancelled")}
                        >
                          Cancelled
                        </Button>
                      </ButtonGroup>
                    </Col>
                    <Col md={6} className="text-md-end mt-3 mt-md-0">
                      <div className="bg-primary text-white p-2 rounded d-inline-block">
                        <span className="fw-medium">
                          Total Pesanan: {pagination.total}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {orders.length === 0 ? (
                <Card className="shadow-sm border-0 text-center py-5">
                  <Card.Body>
                    <i className="bi bi-receipt display-1 text-muted opacity-50"></i>
                    <h4 className="mt-3 text-muted">Belum ada pesanan</h4>
                    <p className="text-muted mb-4">
                      {statusFilter
                        ? `Tidak ada pesanan dengan status "${statusFilter}"`
                        : "Anda belum membuat pesanan apapun"}
                    </p>
                    <Button variant="primary" size="lg" href="/order">
                      Pesan Sekarang
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  <Card className="shadow-sm border-0">
                    <div className="table-responsive">
                      <Table hover className="mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-4">No. Pesanan</th>
                            <th>Tanggal</th>
                            <th>Tipe</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th className="pe-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr
                              key={order.order_id}
                              className={styles.tableRow}
                            >
                              <td className="ps-4">
                                <div>
                                  <strong className="text-danger-emphasis">
                                    #{order.order_id}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    Antrian: {order.nomor_antrian || "-"}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <small>{formatDate(order.waktu_pesan)}</small>
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    order.tipe_pesanan === "dine_in"
                                      ? "primary"
                                      : "secondary"
                                  }
                                  className="text-capitalize"
                                >
                                  {order.tipe_pesanan === "dine_in"
                                    ? "Dine In"
                                    : "Takeaway"}
                                </Badge>
                              </td>
                              <td>
                                <div>
                                  <span className="fw-medium">
                                    {order.items ? order.items.length : 0} item
                                  </span>
                                  {order.items && order.items.length > 0 && (
                                    <small
                                      className="d-block text-muted text-truncate"
                                      style={{ maxWidth: "150px" }}
                                    >
                                      {order.items[0]?.product_name}
                                      {order.items.length > 1 &&
                                        ` +${order.items.length - 1} lainnya`}
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td className="fw-bold">
                                {formatCurrency(order.total_harga)}
                              </td>
                              <td>{getStatusBadge(order.status)}</td>
                              <td className="pe-4 text-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() =>
                                    handleOrderClick(order.order_id)
                                  }
                                  className="px-3"
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  Detail
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card>

                  {pagination.pages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="me-2"
                        >
                          <i className="bi bi-chevron-left"></i> Sebelumnya
                        </Button>

                        <div className="mx-2">{renderPaginationItems()}</div>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={currentPage >= pagination.pages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="ms-2"
                        >
                          Selanjutnya <i className="bi bi-chevron-right"></i>
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <Modal
                show={selectedOrder !== null}
                onHide={handleCloseModal}
                size="lg"
                centered
              >
                <Modal.Header closeButton className="border-0 pb-0">
                  <Modal.Title className="h5">
                    Detail Pesanan #{selectedOrder?.order_id}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                  {selectedOrder && (
                    <>
                      <Row className="mb-4">
                        <Col md={6}>
                          <h6 className="fw-bold text-danger-emphasis">
                            Informasi Pesanan
                          </h6>
                          <div className="small">
                            <p className="mb-1">
                              <strong>No. Antrian:</strong>{" "}
                              {selectedOrder.nomor_antrian || "-"}
                            </p>
                            <p className="mb-1">
                              <strong>Tipe:</strong>{" "}
                              {selectedOrder.tipe_pesanan === "dine_in"
                                ? "Dine In"
                                : "Takeaway"}
                            </p>
                            <p className="mb-1">
                              <strong>Status:</strong>{" "}
                              {getStatusBadge(selectedOrder.status)}
                            </p>
                            <p className="mb-0">
                              <strong>Tanggal:</strong>{" "}
                              {formatDate(selectedOrder.waktu_pesan)}
                            </p>
                          </div>
                        </Col>
                        <Col md={6}>
                          <h6 className="fw-bold text-danger-emphasis">
                            Informasi Pelanggan
                          </h6>
                          <div className="small">
                            <p className="mb-1">
                              <strong>Nama:</strong>{" "}
                              {selectedOrder.customer_name || user?.nama}
                            </p>
                            <p className="mb-1">
                              <strong>Telepon:</strong>{" "}
                              {selectedOrder.customer_phone ||
                                user?.nomor_telepon}
                            </p>
                            {selectedOrder.notes && (
                              <p className="mb-0">
                                <strong>Catatan:</strong> {selectedOrder.notes}
                              </p>
                            )}
                          </div>
                        </Col>
                      </Row>

                      <hr />

                      <h6 className="fw-bold text-danger-emphasis">
                        Items Pesanan
                      </h6>
                      <div className="table-responsive">
                        <Table size="sm" className="mb-0">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th className="text-center">Qty</th>
                              <th className="text-end">Harga</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items?.map((item, index) => (
                              <tr key={index}>
                                <td>{item.product_name}</td>
                                <td className="text-center">{item.jumlah}</td>
                                <td className="text-end">
                                  {formatCurrency(item.harga_satuan)}
                                </td>
                                <td className="text-end">
                                  {formatCurrency(item.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-top">
                            <tr>
                              <td colSpan="3" className="text-end fw-bold">
                                Total:
                              </td>
                              <td className="text-end fw-bold text-success">
                                {formatCurrency(selectedOrder.total_harga)}
                              </td>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                  <Button
                    variant="outline-secondary"
                    onClick={handleCloseModal}
                  >
                    Tutup
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default OrderHistory;
