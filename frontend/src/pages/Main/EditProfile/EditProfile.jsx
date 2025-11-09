import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tab,
  Nav,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { customerService } from "../../../services/customerService";
import { authService } from "../../../services/authService";
import { updateUserProfile } from "../../../store/slices/authSlice";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import styles from "./EditProfile.module.css";

const removeCountryCode = (phone) => {
  if (!phone) return "";

  const cleaned = phone.toString().replace(/\D/g, "");

  if (cleaned.startsWith("62")) {
    return cleaned.slice(2);
  }

  return cleaned;
};

const addCountryCode = (phone) => {
  if (!phone) return "";

  const cleaned = phone.toString().replace(/\D/g, "");

  if (cleaned.startsWith("62")) {
    return cleaned;
  }

  return "62" + cleaned;
};

const EditProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [hasPassword, setHasPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    nama: "",
    email: "",
    nomor_telepon: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // console.log("User data from Redux:", user);
    // console.log("User has_password:", user?.has_password);

    if (user) {
      setProfileData({
        nama: user.nama || "",
        email: user.email || "",
        nomor_telepon: removeCountryCode(user.nomor_telepon) || "",
      });

      const userHasPassword = Boolean(user.has_password);
      // console.log("Setting has_password to:", userHasPassword);
      setHasPassword(userHasPassword);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    if (name === "nomor_telepon") {
      const numericValue = value.replace(/\D/g, "");
      setProfileData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError("");
    setSuccess("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const validateProfile = () => {
    if (!profileData.nama.trim()) {
      setError("Nama harus diisi");
      return false;
    }
    if (!profileData.email.trim()) {
      setError("Email harus diisi");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      setError("Format email tidak valid");
      return false;
    }
    if (!profileData.nomor_telepon.trim()) {
      setError("Nomor telepon harus diisi");
      return false;
    }
    if (!/^[0-9]{9,13}$/.test(profileData.nomor_telepon)) {
      setError("Nomor telepon harus 9-13 digit angka");
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (hasPassword && !passwordData.currentPassword) {
      setError("Password saat ini harus diisi");
      return false;
    }

    if (!passwordData.newPassword) {
      setError("Password baru harus diisi");
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Konfirmasi password tidak sesuai");
      return false;
    }
    return true;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateProfile()) return;

    setSaving(true);
    try {
      const dataToSend = {
        ...profileData,
        nomor_telepon: addCountryCode(profileData.nomor_telepon),
      };

      // console.log("Sending profile update:", dataToSend);

      const response = await customerService.updateProfile(dataToSend);
      // console.log("Profile update response:", response);

      const updatedUser = {
        ...response.user,
        has_password:
          response.user.has_password !== undefined
            ? response.user.has_password
            : hasPassword,
      };

      dispatch(updateUserProfile(updatedUser));
      setHasPassword(updatedUser.has_password);

      // console.log(
      //   "After profile update - has_password:",
      //   updatedUser.has_password
      // );

      setSuccess("Profil berhasil diperbarui");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.error || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePassword()) return;

    setSaving(true);
    try {
      const payload = {
        new_password: passwordData.newPassword,
        is_initial_setup: !hasPassword,
      };

      if (hasPassword) {
        payload.current_password = passwordData.currentPassword;
      }

      // console.log("Sending password change request:", payload);

      const response = await customerService.changePassword(payload);
      // console.log("Password change response:", response);

      try {
        // console.log("Refreshing user data after password change...");
        const refreshedUser = await authService.getCurrentUser();
        // console.log("Refreshed user data:", refreshedUser);

        if (refreshedUser) {
          dispatch(updateUserProfile(refreshedUser));
          setHasPassword(refreshedUser.has_password);
          // console.log(
          //   "User data refreshed, has_password:",
          //   refreshedUser.has_password
          // );
        }
      } catch (refreshError) {
        // console.error("Error refreshing user data:", refreshError);
        setHasPassword(true);
        dispatch(updateUserProfile({ has_password: true }));
      }

      setSuccess(
        hasPassword ? "Password berhasil diubah" : "Password berhasil dibuat."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password change error:", err);
      setError(err.response?.data?.error || "Gagal mengubah password");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belum pernah login";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Format tanggal tidak valid";
    }
  };

  const getStatusInfo = () => {
    const isActive = user?.is_active !== undefined ? user.is_active : 1;
    return {
      isActive: Boolean(isActive),
      text: isActive ? "Aktif" : "Nonaktif",
      variant: isActive ? "success" : "danger",
    };
  };

  if (!user) {
    return (
      <LoadingError
        message="Anda harus login untuk mengakses halaman ini"
        onRetry={() => window.location.reload()}
        showHomeLink={true}
      />
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="text-center mb-4">
            <h1 className="h3">Edit Profil</h1>
            <p className="text-muted">
              Kelola informasi profil dan keamanan akun Anda
            </p>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <Card>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">
                      <i className="bi bi-person me-2"></i>Informasi Profil
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">
                      <i className="bi bi-shield-lock me-2"></i>
                      {hasPassword ? "Ubah Password" : "Buat Password"}
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="profile">
                    <Form onSubmit={handleProfileSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nama Lengkap</Form.Label>
                            <Form.Control
                              type="text"
                              name="nama"
                              value={profileData.nama}
                              onChange={handleProfileChange}
                              placeholder="Masukkan nama lengkap"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={profileData.email}
                              onChange={handleProfileChange}
                              placeholder="nama@email.com"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Nomor Telepon</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>+62</InputGroup.Text>
                          <Form.Control
                            type="tel"
                            name="nomor_telepon"
                            value={profileData.nomor_telepon}
                            onChange={handleProfileChange}
                            placeholder="81234567890"
                            required
                            maxLength={15}
                          />
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Nomor telepon akan digunakan untuk login dan
                          notifikasi
                        </Form.Text>
                      </Form.Group>

                      <div className="d-flex justify-content-between">
                        <div>
                          <small className="text-muted">
                            Terdaftar sejak: {formatDate(user?.created_at)}
                          </small>
                        </div>
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={saving}
                        >
                          {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="password">
                    <Form onSubmit={handlePasswordSubmit}>
                      {hasPassword && (
                        <Form.Group className="mb-3">
                          <Form.Label>Password Saat Ini</Form.Label>
                          <Form.Control
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Masukkan password saat ini"
                            required={hasPassword}
                          />
                          <Form.Text className="text-muted">
                            Wajib diisi untuk verifikasi keamanan
                          </Form.Text>
                        </Form.Group>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label>
                          {hasPassword ? "Password Baru" : "Buat Password Baru"}
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder={
                            hasPassword
                              ? "Masukkan password baru"
                              : "Buat password baru Anda"
                          }
                          required
                        />
                        <Form.Text className="text-muted">
                          Minimal 6 karakter
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          {hasPassword
                            ? "Konfirmasi Password Baru"
                            : "Konfirmasi Password"}
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder={
                            hasPassword
                              ? "Konfirmasi password baru"
                              : "Konfirmasi password Anda"
                          }
                          required
                        />
                      </Form.Group>

                      {!hasPassword && (
                        <Alert variant="info" className="mb-3">
                          <i className="bi bi-info-circle me-2"></i>
                          Anda belum memiliki password.
                        </Alert>
                      )}

                      <div className="d-flex justify-content-end">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={saving}
                        >
                          {saving
                            ? "Menyimpan..."
                            : hasPassword
                            ? "Ubah Password"
                            : "Buat Password"}
                        </Button>
                      </div>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0">Informasi Akun</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Role:</strong>{" "}
                    <Badge bg="info">{user?.role || "pelanggan"}</Badge>
                  </p>
                  <p>
                    <strong>User ID:</strong> #{user?.user_id || "N/A"}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Terakhir Login:</strong>{" "}
                    {formatDate(user?.last_login)}
                  </p>
                  <p>
                    <strong>Status Password:</strong>{" "}
                    <Badge bg={hasPassword ? "success" : "warning"}>
                      {hasPassword ? "Sudah diatur" : "Belum diatur"}
                    </Badge>
                  </p>
                  <p>
                    <strong>Status Akun:</strong>{" "}
                    <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;
