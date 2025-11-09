import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, requireAuth = false }) => {
  const user = useSelector((state) => state.auth.user);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user || storedUser;
  const location = useLocation();

  if (requireAuth && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && !allowedRoles) {
    return children;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.role === "kasir" && !allowedRoles.includes("kasir")) {
    return <Navigate to="/kasir" replace />;
  }

  if (currentUser.role === "pelanggan" && !allowedRoles.includes("pelanggan")) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
