import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Badge,
  Modal,
  Card,
  Alert,
  Pagination,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { userService } from "../../../services/userService";
import LoadingError from "../../common/ErrorDisplay/LoadingError";
import styles from "./UserManagement.module.css";

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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    role: "",
  });

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    nomor_telepon: "",
    password: "",
    role: "pelanggan",
    is_active: true,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput && prev.page === 1) return prev;
        return { ...prev, search: searchInput, page: 1 };
      });
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAllUsers({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        role: filters.role,
      });

      let responseData;
      if (response.data && typeof response.data === "object") {
        responseData = response.data;
      } else if (response.users) {
        responseData = response;
      } else {
        responseData = { users: [], pagination: null };
      }

      const usersList = Array.isArray(responseData.users)
        ? responseData.users
        : Array.isArray(responseData)
        ? responseData
        : [];

      const paginationData = responseData.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: usersList.length,
        pages: Math.ceil(usersList.length / filters.limit),
      };

      setUsers(usersList);
      setPagination(paginationData);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memuat data pengguna";
      setError(errorMsg);
      setUsers([]);
      setPagination({
        page: 1,
        limit: filters.limit,
        total: 0,
        pages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.search, filters.role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const clearSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      role: "",
      page: 1,
    }));
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      email: "",
      nomor_telepon: "",
      password: "",
      role: "pelanggan",
      is_active: true,
    });
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    return /^[0-9]{9,13}$/.test(cleaned);
  };

  const handleAddUser = async () => {
    if (!formData.nama || !formData.email || !formData.password) {
      setError("Nama, email, dan password harus diisi");
      return;
    }

    if (
      formData.nomor_telepon &&
      !validatePhoneNumber(formData.nomor_telepon)
    ) {
      setError("Nomor telepon harus 9-13 digit angka");
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const dataToSend = {
        ...formData,
        nomor_telepon: formData.nomor_telepon
          ? addCountryCode(formData.nomor_telepon)
          : "",
      };

      const response = await userService.createUser(dataToSend);

      if (response.data?.message || response.message) {
        setShowAddModal(false);
        resetForm();
        showSuccess("Pengguna berhasil ditambahkan!");
        fetchUsers();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal menambahkan pengguna";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      nama: user.nama || "",
      email: user.email || "",
      nomor_telepon: removeCountryCode(user.nomor_telepon) || "",
      password: "",
      role: user.role || "pelanggan",
      is_active: user.is_active !== undefined ? user.is_active : true,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!formData.nama || !formData.email) {
      setError("Nama dan email harus diisi");
      return;
    }

    if (
      formData.nomor_telepon &&
      !validatePhoneNumber(formData.nomor_telepon)
    ) {
      setError("Nomor telepon harus 9-13 digit angka");
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const updateData = {
        nama: formData.nama,
        email: formData.email,
        nomor_telepon: formData.nomor_telepon
          ? addCountryCode(formData.nomor_telepon)
          : "",
        role: formData.role,
        is_active: formData.is_active,
      };

      const response = await userService.updateUser(
        selectedUser.user_id,
        updateData
      );

      if (response.data?.message || response.message) {
        setShowEditModal(false);
        showSuccess("Pengguna berhasil diperbarui!");
        fetchUsers();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memperbarui pengguna";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setOperationLoading(true);
      setError(null);

      const response = await userService.deleteUser(selectedUser.user_id);

      if (response.data?.message || response.message) {
        setShowDeleteModal(false);
        showSuccess("Pengguna berhasil dihapus!");
        fetchUsers();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal menghapus pengguna";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">Aktif</Badge>
    ) : (
      <Badge bg="danger">Nonaktif</Badge>
    );
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { bg: "danger", text: "Admin" },
      kasir: { bg: "warning", text: "Kasir" },
      pelanggan: { bg: "info", text: "Pelanggan" },
    }[role] || { bg: "secondary", text: role };

    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const displayPhoneNumber = (phone) => {
    if (!phone) return "-";
    return removeCountryCode(phone);
  };

  const totalPages =
    pagination.pages || Math.ceil(pagination.total / pagination.limit);
  const startEntry =
    pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endEntry = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="h4 mb-1">Manajemen Pengguna</Card.Title>
              <Card.Text className="text-muted mb-0">
                Kelola data pengguna sistem Roti & Kopi Co
              </Card.Text>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              disabled={operationLoading}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Tambah Pengguna
            </Button>
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
            <Col md={3}>
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
                <Form.Label>Cari Pengguna</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setFilters((prev) => ({
                          ...prev,
                          search: searchInput,
                          page: 1,
                        }));
                      }
                    }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={clearSearch}
                    disabled={!filters.search && !filters.role}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter Role</Form.Label>
                <Form.Select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                >
                  <option value="">Semua Role</option>
                  <option value="admin">Admin</option>
                  <option value="kasir">Kasir</option>
                  <option value="pelanggan">Pelanggan</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={clearSearch}
                disabled={!filters.search && !filters.role}
                className="w-100"
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset Filter
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {users.length > 0 ? (
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
                  <th>No</th>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Telepon</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Tanggal Dibuat</th>
                  <th width="120">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const rowNumber =
                    (filters.page - 1) * filters.limit + index + 1;
                  return (
                    <tr key={user.user_id}>
                      <td className="fw-bold text-muted">{rowNumber}</td>
                      <td className="fw-bold text-muted">#{user.user_id}</td>
                      <td>{user.nama}</td>
                      <td>{user.email}</td>
                      <td>{displayPhoneNumber(user.nomor_telepon) || "-"}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{getStatusBadge(user.is_active)}</td>
                      <td>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Edit pengguna"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(user)}
                            disabled={user.role === "admin"}
                            title={
                              user.role === "admin"
                                ? "Tidak dapat menghapus admin"
                                : "Hapus pengguna"
                            }
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
            {users.map((user) => (
              <Card key={user.user_id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">{user.nama}</h6>
                      <small className="text-muted">ID: #{user.user_id}</small>
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmDelete(user)}
                        disabled={user.role === "admin"}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <i className="bi bi-envelope me-2 text-muted"></i>
                    {user.email}
                  </div>

                  <div className="mb-2">
                    <i className="bi bi-telephone me-2 text-muted"></i>
                    {displayPhoneNumber(user.nomor_telepon) || "-"}
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>{getRoleBadge(user.role)}</div>
                    <div>{getStatusBadge(user.is_active)}</div>
                  </div>

                  {user.created_at && (
                    <small className="text-muted">
                      Dibuat:{" "}
                      {new Date(user.created_at).toLocaleDateString("id-ID")}
                    </small>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-people display-1 text-muted"></i>
            <h5 className="mt-3">Tidak ada pengguna ditemukan</h5>
            <p className="text-muted mb-4">
              {filters.search || filters.role
                ? `Tidak ada hasil untuk pencarian Anda. Coba dengan kata kunci lain.`
                : "Belum ada pengguna yang terdaftar dalam sistem."}
            </p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-circle me-2"></i> Tambah Pengguna Pertama
            </Button>
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
                <strong>{pagination.total}</strong> pengguna
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

      {/* Modal Tambah Pengguna */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tambah Pengguna Baru</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nama Lengkap *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nama: e.target.value }))
                  }
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="contoh@email.com"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nomor Telepon</Form.Label>
                <InputGroup>
                  <InputGroup.Text>+62</InputGroup.Text>
                  <Form.Control
                    type="tel"
                    value={formData.nomor_telepon}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        nomor_telepon: numericValue,
                      }));
                    }}
                    placeholder="81234567890"
                    maxLength={13}
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Nomor telepon akan digunakan untuk login dan notifikasi
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="pelanggan">Pelanggan</option>
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Password *</Form.Label>
            <Form.Control
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Akun aktif"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddModal(false)}
          >
            Batal
          </Button>
          <Button
            className={styles.button}
            onClick={handleAddUser}
            disabled={
              operationLoading ||
              !formData.nama ||
              !formData.email ||
              !formData.password
            }
          >
            {operationLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Tambah Pengguna"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Edit Pengguna */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Pengguna #{selectedUser?.user_id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nama Lengkap *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nama: e.target.value }))
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nomor Telepon</Form.Label>
                <InputGroup>
                  <InputGroup.Text>+62</InputGroup.Text>
                  <Form.Control
                    type="tel"
                    value={formData.nomor_telepon}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        nomor_telepon: numericValue,
                      }));
                    }}
                    placeholder="81234567890"
                    maxLength={13}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="pelanggan">Pelanggan</option>
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Check
            type="checkbox"
            label="Akun aktif"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
            }
          />

          <Alert variant="info" className="mt-3">
            <small>
              <i className="bi bi-info-circle me-2"></i>
              Kosongkan field password jika tidak ingin mengubah password.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowEditModal(false)}
          >
            Batal
          </Button>
          <Button
            className={styles.button}
            onClick={handleUpdateUser}
            disabled={operationLoading || !formData.nama || !formData.email}
          >
            {operationLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Apakah Anda yakin ingin menghapus pengguna{" "}
          <strong>{selectedUser?.nama}</strong>?
          <br />
          <small className="text-muted">
            Tindakan ini tidak dapat dibatalkan.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteUser}
            disabled={operationLoading}
          >
            {operationLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Ya, Hapus"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
