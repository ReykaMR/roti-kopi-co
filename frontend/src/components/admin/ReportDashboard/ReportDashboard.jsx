import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Pagination,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { orderService } from "../../../services/orderService";
import { helpers } from "../../../utils/helpers";
import LoadingError from "../../common/ErrorDisplay/LoadingError";
import styles from "./ReportDashboard.module.css";

const ReportDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: new Date().toISOString().split("T")[0],
    group_by: "day",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setFilters((prev) => ({
      ...prev,
      start_date: thirtyDaysAgo.toISOString().split("T")[0],
    }));
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!filters.start_date || !filters.end_date) {
        setError("Tanggal mulai dan tanggal akhir harus diisi");
        return;
      }

      if (new Date(filters.start_date) > new Date(filters.end_date)) {
        setError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
        return;
      }

      const response = await orderService.getSalesReport(filters);

      let reportsData = [];
      if (Array.isArray(response)) {
        reportsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        reportsData = response.data;
      } else {
        throw new Error("Format data laporan tidak valid");
      }

      const processedReports = reportsData
        .map((report) => ({
          period: report.period || "",
          total_orders: parseInt(report.total_orders) || 0,
          total_revenue: parseFloat(report.total_revenue) || 0,
          average_order_value: parseFloat(report.average_order_value) || 0,
        }))
        .filter((report) => report.period);

      setReports(processedReports);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memuat data laporan";
      setError(errorMsg);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (filters.start_date && filters.end_date) {
      fetchReports();
    }
  }, [fetchReports]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setFilters({
      start_date: thirtyDaysAgo.toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      group_by: "day",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleExportReport = async () => {
    try {
      setExportLoading(true);
      setError(null);

      const csvHeaders =
        "Periode,Jumlah Pesanan,Total Pendapatan,Rata-rata Pesanan\n";
      const csvData = filteredReports
        .map(
          (report) =>
            `"${formatPeriod(report.period, filters.group_by)}",${
              report.total_orders
            },${report.total_revenue},${report.average_order_value}`
        )
        .join("\n");

      const csvContent = csvHeaders + csvData;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-penjualan-${filters.start_date}-hingga-${filters.end_date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Laporan berhasil diunduh sebagai CSV!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      const errorMsg =
        "Gagal mengunduh laporan: " + (err.message || "Error tidak diketahui");
      setError(errorMsg);
    } finally {
      setExportLoading(false);
    }
  };

  const filteredReports = reports.filter(
    (report) =>
      report.period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.total_orders.toString().includes(searchTerm) ||
      report.total_revenue.toString().includes(searchTerm) ||
      helpers
        .formatCurrency(report.total_revenue)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const formatPeriod = (period, groupBy) => {
    try {
      if (groupBy === "day") {
        return new Date(period).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      } else if (groupBy === "month") {
        const [year, month] = period.split("-");
        return new Date(year, month - 1).toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
      } else if (groupBy === "year") {
        return `Tahun ${period}`;
      }
      return period;
    } catch (error) {
      return period;
    }
  };

  const totals = filteredReports.reduce(
    (acc, report) => ({
      total_orders: acc.total_orders + report.total_orders,
      total_revenue: acc.total_revenue + report.total_revenue,
      average_order_value: 0,
    }),
    { total_orders: 0, total_revenue: 0, average_order_value: 0 }
  );

  totals.average_order_value =
    totals.total_orders > 0 ? totals.total_revenue / totals.total_orders : 0;

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const startEntry = filteredReports.length > 0 ? startIndex + 1 : 0;
  const endEntry = Math.min(startIndex + itemsPerPage, filteredReports.length);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data laporan...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="h4 mb-1">Laporan Penjualan</Card.Title>
              <Card.Text className="text-muted mb-0">
                Analisis performa penjualan Roti & Kopi Co
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
                  value={itemsPerPage}
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
                <Form.Label>Cari Laporan</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari periode, pesanan, atau pendapatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={clearSearch}
                    disabled={!searchTerm}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Kelompokkan Berdasarkan</Form.Label>
                <Form.Select
                  value={filters.group_by}
                  onChange={(e) =>
                    handleFilterChange("group_by", e.target.value)
                  }
                >
                  <option value="day">Harian</option>
                  <option value="month">Bulanan</option>
                  <option value="year">Tahunan</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Button
                variant="success"
                onClick={handleExportReport}
                disabled={exportLoading || filteredReports.length === 0}
                className="w-100"
              >
                {exportLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <i className="bi bi-download me-2"></i> Ekspor Laporan
                  </>
                )}
              </Button>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col md={4}>
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
            <Col md={4}>
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
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                onClick={resetFilters}
                className="w-100"
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset Filter
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm bg-light-subtle text-dark">
            <Card.Body className="text-center">
              <div className="h6 mb-2">Total Pesanan</div>
              <div className="h3 fw-bold">{totals.total_orders}</div>
              <small>Seluruh Periode</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm bg-light-subtle text-dark">
            <Card.Body className="text-center">
              <div className="h6 mb-2">Total Pendapatan</div>
              <div className="h3 fw-bold">
                {helpers.formatCurrency(totals.total_revenue)}
              </div>
              <small>Seluruh Periode</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm bg-light-subtle text-dark">
            <Card.Body className="text-center">
              <div className="h6 mb-2">Rata-rata Pesanan</div>
              <div className="h3 fw-bold">
                {helpers.formatCurrency(totals.average_order_value)}
              </div>
              <small>Per Pesanan</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm bg-light-subtle text-dark">
            <Card.Body className="text-center">
              <div className="h6 mb-2">Jumlah Data</div>
              <div className="h3 fw-bold">{filteredReports.length}</div>
              <small>
                {filters.group_by === "day"
                  ? "Hari"
                  : filters.group_by === "month"
                  ? "Bulan"
                  : "Tahun"}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {filteredReports.length > 0 ? (
        <>
          <div className="d-none d-md-block">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Detail Laporan Penjualan</h5>
                <span className="text-muted">
                  Menampilkan {startEntry} - {endEntry} dari{" "}
                  {filteredReports.length} entri
                </span>
              </Card.Header>
              <Card.Body>
                <Table
                  responsive
                  bordered
                  hover
                  className="align-middle text-center"
                >
                  <thead className="table-light">
                    <tr>
                      <th>Periode</th>
                      <th>Jumlah Pesanan</th>
                      <th>Total Pendapatan</th>
                      <th>Rata-rata per Pesanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((report, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">
                          {formatPeriod(report.period, filters.group_by)}
                        </td>
                        <td>{report.total_orders}</td>
                        <td className="fw-bold">
                          {helpers.formatCurrency(report.total_revenue)}
                        </td>
                        <td>
                          {helpers.formatCurrency(report.average_order_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {totals.total_orders > 0 && (
                    <tfoot className="table-light fw-bold">
                      <tr>
                        <td>Total</td>
                        <td>{totals.total_orders}</td>
                        <td>{helpers.formatCurrency(totals.total_revenue)}</td>
                        <td>
                          {helpers.formatCurrency(totals.average_order_value)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </Table>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="text-muted">
                      Halaman {currentPage} dari {totalPages}
                    </div>
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      />
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === currentPage}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <Pagination.Ellipsis key={pageNum} />;
                        }
                        return null;
                      })}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          <div className="d-md-none">
            {currentItems.map((report, index) => (
              <Card key={index} className="mb-3">
                <Card.Body>
                  <h6 className="mb-3">
                    {formatPeriod(report.period, filters.group_by)}
                  </h6>
                  <Row className="text-center">
                    <Col xs={6} className="mb-2">
                      <div className="text-muted small">Pesanan</div>
                      <div className="h5 fw-bold">{report.total_orders}</div>
                    </Col>
                    <Col xs={6} className="mb-2">
                      <div className="text-muted small">Pendapatan</div>
                      <div className="h5 fw-bold">
                        {helpers.formatCurrency(report.total_revenue)}
                      </div>
                    </Col>
                    <Col xs={12} className="mb-2">
                      <div className="text-muted small">
                        Rata-rata per Pesanan
                      </div>
                      <div className="h6 fw-bold">
                        {helpers.formatCurrency(report.average_order_value)}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}

            {totalPages > 1 && (
              <Card className="mt-3">
                <Card.Body className="text-center">
                  <Pagination size="sm" className="mb-2">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                  <div className="text-muted">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-graph-up display-1 text-muted"></i>
            <h5 className="mt-3">Tidak ada data laporan</h5>
            <p className="text-muted mb-4">
              {searchTerm
                ? `Tidak ada hasil untuk pencarian Anda. Coba dengan kata kunci lain.`
                : "Tidak ada data laporan untuk periode yang dipilih."}
            </p>
            {searchTerm ? (
              <Button variant="primary" onClick={clearSearch}>
                <i className="bi bi-x-circle me-2"></i> Hapus Pencarian
              </Button>
            ) : (
              <Button variant="primary" onClick={resetFilters}>
                <i className="bi bi-arrow-clockwise me-2"></i> Muat Ulang Data
              </Button>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ReportDashboard;
