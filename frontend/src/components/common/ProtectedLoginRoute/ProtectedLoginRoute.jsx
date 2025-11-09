import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const ProtectedLoginRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        navigate("/unauthorized", { replace: true });
        return;
      }

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "kasir") {
        navigate("/kasir", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, allowedRoles, location]);

  return children;
};

export default ProtectedLoginRoute;
