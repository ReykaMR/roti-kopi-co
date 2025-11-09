import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";

const Unauthorized = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.role === "kasir") {
        navigate("/kasir", { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="text-center p-4" style={{ maxWidth: "500px" }}>
        <Card.Body>
          <i
            className="bi bi-shield-exclamation"
            style={{ fontSize: "4rem", color: "#dc3545" }}
          ></i>
          <h2 className="mt-3">Akses Ditolak</h2>
          <p className="text-muted">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          {user && (
            <p>
              Role Anda: <strong>{user.role}</strong>
            </p>
          )}
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              onClick={() => {
                if (user?.role === "kasir") {
                  navigate("/kasir");
                } else if (user?.role === "admin") {
                  navigate("/admin");
                } else {
                  navigate("/");
                }
              }}
            >
              Kembali ke Dashboard
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate("/")}>
              Ke Halaman Utama
            </Button>
          </div>
          <p className="mt-3 small text-muted">
            Anda akan diarahkan otomatis dalam 5 detik...
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Unauthorized;
