import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { orderService } from "../../services/orderService";
import { userService } from "../../services/userService";
import { productService } from "../../services/productService";
import { helpers } from "../../utils/helpers";
import LoadingError from "../../components/common/ErrorDisplay/LoadingError";
import TokenErrorHandler from "../../components/common/TokenErrorHandler";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    today: { orders: 0, revenue: 0 },
    monthlyRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
    activePromos: 0,
    totalDiscount: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        orderService.getAllOrders({
          start_date: new Date().toISOString().split("T")[0],
        }),
        orderService.getSalesReport({
          start_date: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          )
            .toISOString()
            .split("T")[0],
          end_date: new Date().toISOString().split("T")[0],
        }),
        orderService.getAllOrders({
          status: "pending",
        }),
        userService.getAllUsers({ limit: 1000 }),
        productService.getAllProducts({ limit: 100, status: "available" }),
      ]);

      const [
        todayResult,
        monthlyResult,
        pendingResult,
        usersResult,
        productsResult,
      ] = results;

      const getData = (result) => {
        if (result.status === "rejected") {
          return null;
        }
        return result.value.data || result.value;
      };

      const todayOrders = getData(todayResult);
      const monthlyReport = getData(monthlyResult);
      const pendingOrders = getData(pendingResult);
      const users = getData(usersResult);
      const products = getData(productsResult);

      const todayRevenue =
        todayOrders?.orders?.reduce(
          (sum, order) => sum + (parseFloat(order.total_harga) || 0),
          0
        ) || 0;

      const monthlyRevenueTotal = Array.isArray(monthlyReport)
        ? monthlyReport.reduce(
            (sum, item) => sum + (parseFloat(item.total_revenue) || 0),
            0
          )
        : parseFloat(monthlyReport?.total_revenue) || 0;

      const productsList = products?.products || products || [];
      const promoProducts = productsList.filter(
        (product) => product.is_promo && product.discount_percent
      );

      const totalDiscount = promoProducts.reduce((sum, product) => {
        if (product.original_price && product.discount_percent) {
          const discountAmount =
            (product.original_price * product.discount_percent) / 100;
          return sum + discountAmount;
        }
        return sum;
      }, 0);

      setStats({
        today: {
          orders: todayOrders?.orders?.length || 0,
          revenue: todayRevenue,
        },
        monthlyRevenue: monthlyRevenueTotal,
        pendingOrders: pendingOrders?.orders?.length || 0,
        totalUsers: users?.users?.length || users?.length || 0,
        activePromos: promoProducts.length,
        totalDiscount: totalDiscount,
        topProducts: productsList.slice(0, 5),
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Terjadi kesalahan saat memuat dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center my-5">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "var(--primary-color)" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <TokenErrorHandler error={error} />
        <LoadingError
          message={`Gagal memuat dashboard: ${error}`}
          onRetry={fetchDashboardStats}
          showHomeLink={false}
        />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Dashboard Admin</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={fetchDashboardStats}
          disabled={loading}
          title="Refresh data"
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {loading ? "Memuat..." : "Refresh"}
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className={`${styles.statCard} h-100 border-0 shadow-sm`}>
            <Card.Body className="text-center p-4">
              <div className={`${styles.statIcon} mb-3`}>
                <i className="bi bi-cart-check fs-1"></i>
              </div>
              <Card.Title className="h6 text-muted mb-2">
                Pesanan Hari Ini
              </Card.Title>
              <Card.Text className={`${styles.statNumber} h3 fw-bold mb-2`}>
                {stats.today.orders}
              </Card.Text>
              <Badge className="fs-6">
                {helpers.formatCurrency(stats.today.revenue)}
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className={`${styles.statCard} h-100 border-0 shadow-sm`}>
            <Card.Body className="text-center p-4">
              <div className={`${styles.statIcon} mb-3`}>
                <i className="bi bi-graph-up fs-1"></i>
              </div>
              <Card.Title className="h6 text-muted mb-2">
                Pendapatan Bulan Ini
              </Card.Title>
              <Card.Text className={`${styles.statNumber} h3 fw-bold`}>
                {helpers.formatCurrency(stats.monthlyRevenue)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className={`${styles.statCard} h-100 border-0 shadow-sm`}>
            <Card.Body className="text-center p-4">
              <div className={`${styles.statIcon} mb-3`}>
                <i className="bi bi-tag fs-1"></i>
              </div>
              <Card.Title className="h6 text-muted mb-2">
                Produk Promo Aktif
              </Card.Title>
              <Card.Text className={`${styles.statNumber} h3 fw-bold mb-2`}>
                {stats.activePromos}
              </Card.Text>
              <Badge className="fs-6" bg="danger">
                Total Diskon: {helpers.formatCurrency(stats.totalDiscount)}
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className={`${styles.statCard} h-100 border-0 shadow-sm`}>
            <Card.Body className="text-center p-4">
              <div className={`${styles.statIcon} mb-3`}>
                <i className="bi bi-people fs-1"></i>
              </div>
              <Card.Title className="h6 text-muted mb-2">
                Total Pengguna
              </Card.Title>
              <Card.Text className={`${styles.statNumber} h3 fw-bold`}>
                {stats.totalUsers}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Promo Products Section */}
      {stats.activePromos > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-tag me-2"></i>
                  Produk Terbaik
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="justify-content-center">
                  {stats.topProducts
                    .filter(
                      (product) => product.is_promo && product.discount_percent
                    )
                    .slice(0, 4)
                    .map((product) => (
                      <Col key={product.product_id} md={3} className="mb-3">
                        <Card className="h-100">
                          <Card.Body className="text-center">
                            {product.gambar_url && (
                              <img
                                src={product.gambar_url}
                                alt={product.nama}
                                className="mb-2"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <h6 className="mb-1">{product.nama}</h6>
                            <Badge bg="danger" className="mb-2">
                              -{product.discount_percent}%
                            </Badge>
                            <div>
                              <small className="text-decoration-line-through text-muted">
                                {helpers.formatCurrency(product.original_price)}
                              </small>
                              <div className="fw-bold text-danger">
                                {helpers.formatCurrency(product.harga)}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AdminDashboard;
