import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
  Modal,
  Card,
  Alert,
  Pagination,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { orderService } from "../../../services/orderService";
import { helpers } from "../../../utils/helpers";
import LoadingError from "../../common/ErrorDisplay/LoadingError";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: "",
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    start_date: "",
    end_date: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    const timerId = setTimeout(() => {
      setSearchTerm((prev) => (prev === searchInput ? prev : searchInput));
      setFilters((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }, 1000);

    return () => clearTimeout(timerId);
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getAllOrders({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        start_date: filters.start_date,
        end_date: filters.end_date,
      });

      let responseData;
      if (response.data && typeof response.data === "object") {
        responseData = response.data;
      } else if (response.orders) {
        responseData = response;
      } else {
        responseData = { orders: [], pagination: null };
      }

      const ordersList = Array.isArray(responseData.orders)
        ? responseData.orders
        : Array.isArray(responseData)
        ? responseData
        : [];

      const filteredOrders = searchTerm
        ? ordersList.filter((order) => {
            const s = searchTerm.toLowerCase();
            return (
              order.customer_name?.toLowerCase().includes(s) ||
              order.nomor_antrian?.toString().toLowerCase().includes(s) ||
              order.customer_phone?.toString().includes(searchTerm)
            );
          })
        : ordersList;

      const paginationData = responseData.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: filteredOrders.length,
        pages: Math.ceil(filteredOrders.length / filters.limit),
      };

      setOrders(filteredOrders);
      setPagination(paginationData);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memuat data pesanan";
      setError(errorMsg);
      setOrders([]);
      setPagination({
        page: 1,
        limit: filters.limit,
        total: 0,
        pages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.start_date,
    filters.end_date,
    searchTerm,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    handleFilterChange("limit", newLimit);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setFilters((prev) => ({
      ...prev,
      status: "",
      start_date: "",
      end_date: "",
      page: 1,
    }));
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleViewOrder = async (order) => {
    try {
      setOperationLoading(true);
      setError(null);

      const response = await orderService.getOrderById(order.order_id);

      const orderData = response.data || response;
      setSelectedOrder(orderData);
      setStatusUpdate({
        status: orderData.status || "",
        notes: "",
      });
      setShowDetailModal(true);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memuat detail pesanan";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus pesanan ini?\nTindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const response = await orderService.deleteOrder(orderId);

      if (response.data?.message || response.message) {
        showSuccess("Pesanan berhasil dihapus!");
        fetchOrders();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error || err?.message || "Gagal menghapus pesanan";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      setError("Pilih status terlebih dahulu");
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const response = await orderService.updateOrderStatus(
        selectedOrder.order_id,
        statusUpdate
      );

      if (response.data?.message || response.message) {
        setShowDetailModal(false);
        setStatusUpdate({ status: "", notes: "" });
        showSuccess("Status pesanan berhasil diperbarui!");
        fetchOrders();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memperbarui status pesanan";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "warning", text: "Pending" },
      processing: { bg: "info", text: "Processing" },
      completed: { bg: "success", text: "Completed" },
      cancelled: { bg: "danger", text: "Cancelled" },
    };

    const config = statusConfig[status] || { bg: "secondary", text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getOrderTypeBadge = (type) => {
    return type === "dine_in" ? (
      <Badge bg="primary">Dine In</Badge>
    ) : (
      <Badge bg="secondary">Take Away</Badge>
    );
  };

  const totalPages =
    pagination.pages || Math.ceil(pagination.total / pagination.limit);
  const startEntry =
    pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endEntry = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  const hasActiveFilters =
    searchTerm || filters.status || filters.start_date || filters.end_date;

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data pesanan...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="h4 mb-1">Manajemen Pesanan</Card.Title>
              <Card.Text className="text-muted mb-0">
                Kelola semua pesanan dari pelanggan Roti & Kopi Co
              </Card.Text>
            </div>
          </div>

          {successMessage && (
            <Alert variant="success" className="mt-3 mb-0">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={2}>
              <Form.Group>
                <Form.Label>Items per Page</Form.Label>
                <Form.Select
                  value={filters.limit}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Cari Pesanan</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari nama pelanggan atau nomor antrian..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(searchInput);
                        setFilters((prev) => ({ ...prev, page: 1 }));
                      }
                    }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-100"
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset Filter
              </Button>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Dari Tanggal</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value)
                  }
                  max={
                    filters.end_date || new Date().toISOString().split("T")[0]
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sampai Tanggal</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    handleFilterChange("end_date", e.target.value)
                  }
                  min={filters.start_date}
                  max={new Date().toISOString().split("T")[0]}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {orders.length > 0 ? (
        <>
          <div className="d-none d-md-block">
            <Table
              responsive
              bordered
              hover
              className="mb-4 align-middle text-center"
            >
              <thead className="table-light">
                <tr>
                  <th width="60">No</th>
                  <th width="80">ID</th>
                  <th>Pelanggan</th>
                  <th width="120">Telepon</th>
                  <th width="120">Antrian</th>
                  <th width="100">Tipe</th>
                  <th width="120">Tanggal</th>
                  <th width="120">Status</th>
                  <th width="120">Total</th>
                  <th width="140">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const rowNumber =
                    (filters.page - 1) * filters.limit + index + 1;
                  return (
                    <tr key={order.order_id}>
                      <td className="fw-bold text-muted">{rowNumber}</td>
                      <td className="fw-bold text-muted">#{order.order_id}</td>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            {order.customer_name}
                          </div>
                        </div>
                      </td>
                      <td>{order.customer_phone || "-"}</td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {order.nomor_antrian}
                        </Badge>
                      </td>
                      <td>{getOrderTypeBadge(order.tipe_pesanan)}</td>
                      <td>
                        {order.waktu_pesan ? (
                          <>
                            <div>
                              {new Date(order.waktu_pesan).toLocaleDateString(
                                "id-ID"
                              )}
                            </div>
                            <small className="text-muted">
                              {new Date(order.waktu_pesan).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </small>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="fw-bold">
                        {helpers.formatCurrency(order.total_harga || 0)}
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            title="Lihat detail pesanan"
                            disabled={operationLoading}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.order_id)}
                            title="Hapus pesanan"
                            disabled={operationLoading}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="d-md-none">
            {orders.map((order) => (
              <Card key={order.order_id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0">#{order.order_id}</h6>
                      <h5 className="mb-0">{order.customer_name}</h5>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="mb-2">
                    <i className="bi bi-telephone me-2 text-muted"></i>
                    {order.customer_phone || "-"}
                  </div>

                  <div className="mb-2">
                    <i className="bi bi-ticket-perforated me-2 text-muted"></i>
                    Antrian:{" "}
                    <Badge bg="light" text="dark">
                      {order.nomor_antrian}
                    </Badge>
                  </div>

                  <div className="mb-2">
                    <i className="bi bi-shop me-2 text-muted"></i>
                    Tipe: {getOrderTypeBadge(order.tipe_pesanan)}
                  </div>

                  <div className="mb-2">
                    <i className="bi bi-calendar me-2 text-muted"></i>
                    {order.waktu_pesan
                      ? new Date(order.waktu_pesan).toLocaleString("id-ID")
                      : "-"}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <strong>
                      {helpers.formatCurrency(order.total_harga || 0)}
                    </strong>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        disabled={operationLoading}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.order_id)}
                        disabled={operationLoading}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-receipt display-1 text-muted"></i>
            <h5 className="mt-3">Tidak ada pesanan ditemukan</h5>
            <p className="text-muted mb-4">
              {hasActiveFilters
                ? `Tidak ada hasil untuk filter yang dipilih. Coba dengan kriteria lain.`
                : "Belum ada pesanan yang tercatat dalam sistem."}
            </p>
            {hasActiveFilters && (
              <Button variant="primary" onClick={clearFilters}>
                <i className="bi bi-x-circle me-2"></i> Hapus Filter
              </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {pagination.total > 0 && (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                Menampilkan <strong>{startEntry}</strong> -{" "}
                <strong>{endEntry}</strong> dari{" "}
                <strong>{pagination.total}</strong> pesanan
              </div>

              <Pagination className="mb-0">
                <Pagination.Prev
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange("page", filters.page - 1)}
                />

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                  ) {
                    return (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === filters.page}
                        onClick={() => handleFilterChange("page", pageNum)}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  } else if (
                    pageNum === filters.page - 2 ||
                    pageNum === filters.page + 2
                  ) {
                    return <Pagination.Ellipsis key={pageNum} />;
                  }
                  return null;
                })}

                <Pagination.Next
                  disabled={filters.page === totalPages}
                  onClick={() => handleFilterChange("page", filters.page + 1)}
                />
              </Pagination>
            </div>
          </Card.Body>
        </Card>
      )}

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Detail Pesanan #{selectedOrder?.order_id}
            {operationLoading && (
              <Spinner animation="border" size="sm" className="ms-2" />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder ? (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Pelanggan:</strong> {selectedOrder.customer_name}
                </Col>
                <Col md={6}>
                  <strong>Telepon:</strong>{" "}
                  {selectedOrder.customer_phone || "-"}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Antrian:</strong> {selectedOrder.nomor_antrian}
                </Col>
                <Col md={6}>
                  <strong>Tipe:</strong>{" "}
                  {getOrderTypeBadge(selectedOrder.tipe_pesanan)}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Tanggal Pesan:</strong>{" "}
                  {selectedOrder.waktu_pesan
                    ? new Date(selectedOrder.waktu_pesan).toLocaleString(
                        "id-ID"
                      )
                    : "-"}
                </Col>
                <Col md={6}>
                  <strong>Status Saat Ini:</strong>{" "}
                  {getStatusBadge(selectedOrder.status)}
                </Col>
              </Row>

              {selectedOrder.notes && (
                <Row className="mb-3">
                  <Col>
                    <strong>Catatan:</strong> {selectedOrder.notes}
                  </Col>
                </Row>
              )}

              <h6 className="mb-3">Items Pesanan:</h6>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="table-responsive">
                  <Table striped size="sm" className="mb-4">
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th width="80">Jumlah</th>
                        <th width="120">Harga</th>
                        <th width="120">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={item.detail_id || index}>
                          <td>
                            <div>
                              <div className="fw-semibold">
                                {item.product_name}
                              </div>
                              {item.product_name !== item.nama && item.nama && (
                                <small className="text-muted">
                                  {item.nama}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="text-center">{item.jumlah}</td>
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
                        <td className="text-end fw-bold">
                          {helpers.formatCurrency(selectedOrder.total_harga)}
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              ) : (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-info-circle me-2"></i> Tidak ada items
                  dalam pesanan ini
                </Alert>
              )}

              <hr />

              <h6 className="mb-3">Update Status Pesanan:</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status Baru *</Form.Label>
                    <Form.Select
                      value={statusUpdate.status}
                      onChange={(e) =>
                        setStatusUpdate((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Catatan Perubahan (Opsional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={statusUpdate.notes}
                  onChange={(e) =>
                    setStatusUpdate((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Tambahkan catatan untuk perubahan status..."
                />
              </Form.Group>
            </>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Memuat detail pesanan...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDetailModal(false)}
          >
            Tutup
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusUpdate}
            disabled={operationLoading || !statusUpdate.status}
          >
            {operationLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagement;
