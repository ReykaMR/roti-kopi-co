import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const TokenErrorHandler = ({ error }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      error &&
      (error.message?.includes("token") ||
        error.message?.includes("autentikasi") ||
        error.message?.includes("sesi") ||
        error.message?.includes("authenticat") ||
        error.response?.status === 401)
    ) {
      dispatch(logout());

      const timer = setTimeout(() => {
        navigate("/login", {
          state: { error: "Sesi telah berakhir. Silakan login kembali." },
          replace: true,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch, navigate]);

  if (
    error &&
    (error.message?.includes("token") ||
      error.message?.includes("autentikasi") ||
      error.message?.includes("sesi") ||
      error.message?.includes("authenticat") ||
      error.response?.status === 401)
  ) {
    return (
      <div className="alert alert-danger">
        <h4>Error Autentikasi</h4>
        <p>
          Sesi Anda telah berakhir atau token tidak valid. Anda akan diarahkan
          ke halaman login.
        </p>
      </div>
    );
  }

  return null;
};

export default TokenErrorHandler;
