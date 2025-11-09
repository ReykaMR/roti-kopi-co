import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index";
import Navbar from "./components/ui/Navbar/Navbar";
import Footer from "./components/ui/Footer/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import OurMenu from "./pages/Main/OurMenu/OurMenu";
import Promo from "./pages/Main/Promo/Promo";
import PromoDetail from "./pages/Main/PromoDetail/PromoDetail";
import SpecialEvent from "./pages/Main/SpecialEvent/SpecialEvent";
import Discover from "./pages/Main/Discover/Discover";
import Login from "./pages/Auth/Login/Login";
import LoginAdmin from "./pages/Auth/LoginAdmin/LoginAdmin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import KasirDashboard from "./pages/KasirDashboard/KasirDashboard";
import Order from "./pages/Main/Order/Order";
import OrderSuccess from "./pages/Main/OrderSuccess/OrderSuccess";
import Checkout from "./pages/Main/Checkout/Checkout";
import Payment from "./pages/Main/Payment/Payment";
import PaymentSuccess from "./pages/Main/PaymentSuccess/PaymentSuccess";
import OrderHistory from "./pages/Main/OrderHistory/OrderHistory";
import EditProfile from "./pages/Main/EditProfile/EditProfile";
import Unauthorized from "./pages/Error/Unauthorized/Unauthorized";
import UserManagement from "./components/admin/UserManagement/UserManagement";
import ProductManagement from "./components/admin/ProductManagement/ProductManagement";
import OrderManagement from "./components/admin/OrderManagement/OrderManagement";
import ReportDashboard from "./components/admin/ReportDashboard/ReportDashboard";
import ProtectedLoginRoute from "./components/common/ProtectedLoginRoute/ProtectedLoginRoute";
import NotFound from "./pages/Error/NotFound/NotFound";
import { useEffect } from "react";

import LayoutAdmin from "./components/common/LayoutAdmin/LayoutAdmin";
import LayoutKasir from "./components/common/LayoutKasir/LayoutKasir";

function AppContent() {
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isLoginAdminPage = location.pathname === "/admin-login";
  const isAdminPage = location.pathname.startsWith("/admin");
  const isKasirPage = location.pathname.startsWith("/kasir");
  const isUnauthorizedPage = location.pathname === "/unauthorized";

  const hideNavbarFooter =
    isLoginPage ||
    isLoginAdminPage ||
    isAdminPage ||
    isKasirPage ||
    isUnauthorizedPage;

  useEffect(() => {
    if (isAdminPage) {
      document.body.classList.add("admin-page");
      document.body.classList.remove("kasir-page", "login-page");
    } else if (isKasirPage) {
      document.body.classList.add("kasir-page");
      document.body.classList.remove("admin-page", "login-page");
    } else if (isLoginPage || isLoginAdminPage) {
      document.body.classList.add("login-page");
      document.body.classList.remove("admin-page", "kasir-page");
    } else {
      document.body.classList.remove("admin-page", "kasir-page", "login-page");
    }
  }, [
    isAdminPage,
    isKasirPage,
    isLoginPage,
    isLoginAdminPage,
    location.pathname,
  ]);

  return (
    <div className="App">
      {!hideNavbarFooter && <Navbar />}
      <main className="flex-shrink-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/our-menu" element={<OurMenu />} />
          <Route path="/promo" element={<Promo />} />
          <Route path="/promo/:id" element={<PromoDetail />} />
          <Route path="/special-event" element={<SpecialEvent />} />
          <Route path="/discover" element={<Discover />} />
          <Route
            path="/order"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order/success"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:orderId"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={["pelanggan"]}>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedLoginRoute>
                <Login />
              </ProtectedLoginRoute>
            }
          />
          <Route
            path="/admin-login"
            element={
              <ProtectedLoginRoute>
                <LoginAdmin />
              </ProtectedLoginRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <LayoutAdmin />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="reports" element={<ReportDashboard />} />
          </Route>
          <Route
            path="/kasir"
            element={
              <ProtectedRoute allowedRoles={["kasir", "admin"]}>
                <LayoutKasir />
              </ProtectedRoute>
            }
          >
            <Route index element={<KasirDashboard />} />
            <Route path="orders" element={<OrderManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideNavbarFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
