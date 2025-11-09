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
import { productService } from "../../../services/productService";
import { helpers } from "../../../utils/helpers";
import LoadingError from "../../common/ErrorDisplay/LoadingError";
import styles from "./ProductManagement.module.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    category: "",
    status: "",
  });

  const [searchInput, setSearchInput] = useState(filters.search || "");

  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    harga: "",
    original_price: "",
    discount_percent: "",
    kategori: "",
    status: "available",
    gambar_url: "",
    is_promo: false,
    valid_until: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const categories = [
    { value: "combo", label: "Combo" },
    { value: "coffee", label: "Coffee" },
    { value: "tea", label: "Tea" },
    { value: "nonCoffee", label: "Non-Coffee" },
    { value: "bread", label: "Bread" },
    { value: "bites", label: "Bites" },
    { value: "bottled", label: "Bottled" },
  ];

  const calculateDiscountedPrice = (originalPrice, discountPercent) => {
    if (!originalPrice || !discountPercent) return "";
    const discountAmount =
      (parseFloat(originalPrice) * parseFloat(discountPercent)) / 100;
    return (parseFloat(originalPrice) - discountAmount).toFixed(2);
  };

  const handleDiscountChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (newData.original_price && newData.discount_percent) {
        newData.harga = calculateDiscountedPrice(
          newData.original_price,
          newData.discount_percent
        );
        newData.is_promo = true;
      } else if (
        field === "original_price" &&
        value &&
        !newData.discount_percent
      ) {
        newData.harga = value;
        newData.is_promo = false;
      } else if (field === "discount_percent" && (!value || value === "0")) {
        newData.harga = newData.original_price || "";
        newData.is_promo = false;
      } else if (
        field === "discount_percent" &&
        value > 0 &&
        !newData.original_price
      ) {
        setError("Harap masukkan harga asli terlebih dahulu");
        return prev;
      }

      return newData;
    });
  };

  const handlePriceChange = (value) => {
    setFormData((prev) => {
      const newData = { ...prev, harga: value };

      if (prev.original_price && prev.discount_percent) {
        const calculatedPrice = calculateDiscountedPrice(
          prev.original_price,
          prev.discount_percent
        );
        if (value !== calculatedPrice) {
          newData.discount_percent = "";
          newData.is_promo = false;
        }
      }

      return newData;
    });
  };

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput && prev.page === 1) return prev;
        return { ...prev, search: searchInput, page: 1 };
      });
    }, 1000);

    return () => clearTimeout(timerId);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAllProducts({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        category: filters.category,
        status: filters.status,
      });

      let responseData;
      if (response.data && typeof response.data === "object") {
        responseData = response.data;
      } else if (response.products) {
        responseData = response;
      } else {
        responseData = { products: [], pagination: null };
      }

      const productsList = Array.isArray(responseData.products)
        ? responseData.products
        : Array.isArray(responseData)
        ? responseData
        : [];

      const paginationData = responseData.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: productsList.length,
        pages: Math.ceil(productsList.length / filters.limit),
      };

      setProducts(productsList);
      setPagination(paginationData);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memuat data produk";
      setError(errorMsg);
      setProducts([]);
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
    filters.search,
    filters.category,
    filters.status,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    setSearchInput("");
    setFilters((prev) => ({
      ...prev,
      search: "",
      category: "",
      status: "",
      page: 1,
    }));
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      deskripsi: "",
      harga: "",
      original_price: "",
      discount_percent: "",
      kategori: "",
      status: "available",
      gambar_url: "",
      is_promo: false,
      valid_until: "",
    });
    setError(null);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);

    let formattedValidUntil = "";
    if (product.valid_until) {
      const date = new Date(product.valid_until);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        formattedValidUntil = `${year}-${month}-${day}`;
      }
    }

    setFormData({
      nama: product.nama || "",
      deskripsi: product.deskripsi || "",
      harga: product.harga || "",
      original_price: product.original_price || product.harga || "",
      discount_percent: product.discount_percent || "",
      kategori: product.kategori || "",
      status: product.status || "available",
      gambar_url: product.gambar_url || "",
      is_promo: product.is_promo || false,
      valid_until: formattedValidUntil,
    });
    setError(null);
    setShowEditModal(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!formData.nama || !formData.harga || !formData.kategori) {
      setError("Nama, harga, dan kategori harus diisi");
      return;
    }

    if (parseFloat(formData.harga) < 0) {
      setError("Harga tidak boleh negatif");
      return;
    }

    if (
      formData.discount_percent &&
      formData.discount_percent > 0 &&
      !formData.original_price
    ) {
      setError("Harga asli harus diisi ketika ada diskon");
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const productData = {
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        harga: parseFloat(formData.harga),
        kategori: formData.kategori,
        status: formData.status,
        gambar_url: formData.gambar_url,
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        discount_percent: formData.discount_percent
          ? parseInt(formData.discount_percent)
          : null,
        is_promo: formData.is_promo ? 1 : 0,
        valid_until: formData.valid_until || null,
      };

      const response = await productService.updateProduct(
        selectedProduct.product_id,
        productData
      );

      if (response.data?.message || response.message) {
        setShowEditModal(false);
        showSuccess("Produk berhasil diperbarui!");
        fetchProducts();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal memperbarui produk";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateNewProduct = async () => {
    if (!formData.nama || !formData.harga || !formData.kategori) {
      setError("Nama, harga, dan kategori harus diisi");
      return;
    }

    if (parseFloat(formData.harga) < 0) {
      setError("Harga tidak boleh negatif");
      return;
    }

    if (
      formData.discount_percent &&
      formData.discount_percent > 0 &&
      !formData.original_price
    ) {
      setError("Harga asli harus diisi ketika ada diskon");
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const productData = {
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        harga: parseFloat(formData.harga),
        kategori: formData.kategori,
        status: formData.status,
        gambar_url: formData.gambar_url,
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        discount_percent: formData.discount_percent
          ? parseInt(formData.discount_percent)
          : null,
        is_promo: formData.is_promo ? 1 : 0,
        valid_until: formData.valid_until || null,
      };

      const response = await productService.createProduct(productData);

      if (response.data?.message || response.message) {
        setShowCreateModal(false);
        showSuccess("Produk berhasil ditambahkan!");
        fetchProducts();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Gagal menambahkan produk";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return;
    }

    try {
      setOperationLoading(true);
      setError(null);

      const response = await productService.deleteProduct(productId);

      if (response.data?.message || response.message) {
        showSuccess("Produk berhasil dihapus!");
        fetchProducts();
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error || err?.message || "Gagal menghapus produk";
      setError(errorMsg);
    } finally {
      setOperationLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === "available" ? (
      <Badge bg="success">Tersedia</Badge>
    ) : (
      <Badge bg="danger">Tidak Tersedia</Badge>
    );
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find((cat) => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getDiscountBadge = (product) => {
    if (product.is_promo && product.discount_percent) {
      return (
        <Badge bg="danger" className="ms-1">
          -{product.discount_percent}%
        </Badge>
      );
    }
    return null;
  };

  const formatPriceDisplay = (product) => {
    if (
      product.is_promo &&
      product.original_price &&
      product.discount_percent
    ) {
      return (
        <div>
          <div className="text-decoration-line-through text-muted small">
            {helpers.formatCurrency(product.original_price)}
          </div>
          <div className="fw-bold text-danger">
            {helpers.formatCurrency(product.harga)}
          </div>
        </div>
      );
    }
    return (
      <div className="fw-bold">{helpers.formatCurrency(product.harga)}</div>
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

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Memuat data produk...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="h4 mb-1">Manajemen Produk</Card.Title>
              <Card.Text className="text-muted mb-0">
                Kelola menu produk Roti & Kopi Co
              </Card.Text>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateProduct}
              disabled={operationLoading}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Tambah Produk Baru
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

            <Col md={3}>
              <Form.Group>
                <Form.Label>Cari Produk</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari nama produk..."
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
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Kategori</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="available">Tersedia</option>
                  <option value="unavailable">Tidak Tersedia</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={clearSearch}
                disabled={
                  !filters.search && !filters.category && !filters.status
                }
                className="w-100"
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset Filter
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {products.length > 0 ? (
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
                  <th>Produk</th>
                  <th width="120">Kategori</th>
                  <th width="150">Harga</th>
                  <th width="120">Status</th>
                  <th width="150">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const rowNumber =
                    (filters.page - 1) * filters.limit + index + 1;
                  return (
                    <tr key={product.product_id}>
                      <td>{rowNumber}</td>
                      <td className="fw-bold text-muted">
                        #{product.product_id}
                      </td>
                      <td className="text-start">
                        <div className="d-flex align-items-center">
                          {product.gambar_url && (
                            <img
                              src={product.gambar_url}
                              alt={product.nama}
                              className="me-3"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold">
                              {product.nama}
                              {getDiscountBadge(product)}
                            </div>
                            {product.deskripsi && (
                              <small
                                className="text-muted d-block"
                                style={{ maxWidth: "300px" }}
                              >
                                {product.deskripsi.length > 80
                                  ? `${product.deskripsi.substring(0, 80)}...`
                                  : product.deskripsi}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="secondary" className="text-capitalize">
                          {getCategoryLabel(product.kategori)}
                        </Badge>
                      </td>
                      <td className="fw-bold">{formatPriceDisplay(product)}</td>
                      <td>{getStatusBadge(product.status)}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            title="Edit produk"
                            disabled={operationLoading}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteProduct(product.product_id)
                            }
                            title="Hapus produk"
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
            {products.map((product) => (
              <Card key={product.product_id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <Badge bg="secondary" className="text-capitalize mb-1">
                        {getCategoryLabel(product.kategori)}
                      </Badge>
                      <h6 className="mb-0 text-muted">#{product.product_id}</h6>
                      <h5 className="mb-0">
                        {product.nama}
                        {getDiscountBadge(product)}
                      </h5>
                    </div>
                    <div>{getStatusBadge(product.status)}</div>
                  </div>

                  {product.gambar_url && (
                    <div className="text-center my-3">
                      <img
                        src={product.gambar_url}
                        alt={product.nama}
                        style={{
                          width: "100%",
                          maxWidth: "200px",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {product.deskripsi && (
                    <p className="mb-2 text-muted small">{product.deskripsi}</p>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    {formatPriceDisplay(product)}
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        disabled={operationLoading}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.product_id)}
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
            <i className="bi bi-box display-1 text-muted"></i>
            <h5 className="mt-3">Tidak ada produk ditemukan</h5>
            <p className="text-muted mb-4">
              {filters.search || filters.category || filters.status
                ? `Tidak ada hasil untuk filter yang dipilih. Coba dengan kriteria lain.`
                : "Belum ada produk yang ditambahkan dalam sistem."}
            </p>
            <Button variant="primary" onClick={handleCreateProduct}>
              <i className="bi bi-plus-circle me-2"></i> Tambah Produk Pertama
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
                <strong>{pagination.total}</strong> produk
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

      {/* Edit Product Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Produk #{selectedProduct?.product_id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Produk *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nama: e.target.value }))
                    }
                    placeholder="Masukkan nama produk"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori *</Form.Label>
                  <Form.Select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        kategori: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deskripsi: e.target.value,
                  }))
                }
                placeholder="Masukkan deskripsi produk (opsional)"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harga Asli (IDR)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="100"
                    value={formData.original_price}
                    onChange={(e) =>
                      handleDiscountChange("original_price", e.target.value)
                    }
                    placeholder="Harga normal sebelum diskon"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diskon (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discount_percent}
                    onChange={(e) =>
                      handleDiscountChange("discount_percent", e.target.value)
                    }
                    placeholder="0"
                  />
                  {formData.discount_percent && formData.original_price && (
                    <Form.Text className="text-success">
                      Harga setelah diskon:{" "}
                      {helpers.formatCurrency(formData.harga)}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harga Jual (IDR) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="100"
                    value={formData.harga}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="0"
                    required
                  />
                  {formData.discount_percent > 0 && (
                    <Form.Text className="text-muted">
                      Harga dihitung otomatis dari diskon
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="available">Tersedia</option>
                    <option value="unavailable">Tidak Tersedia</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>URL Gambar</Form.Label>
              <Form.Control
                type="url"
                value={formData.gambar_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gambar_url: e.target.value,
                  }))
                }
                placeholder="https://example.com/image.jpg"
              />
              {formData.gambar_url && (
                <div className="mt-2 text-center">
                  <img
                    src={formData.gambar_url}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Berakhir Promo</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        valid_until: e.target.value,
                      }))
                    }
                  />
                  <Form.Text className="text-muted">
                    Kosongkan jika promo tidak ada batas waktu
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Produk Promo"
                    checked={formData.is_promo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_promo: e.target.checked,
                      }))
                    }
                  />
                  <Form.Text className="text-muted">
                    Centang jika produk sedang dalam promo
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
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
            onClick={handleUpdateProduct}
            disabled={
              operationLoading ||
              !formData.nama ||
              !formData.harga ||
              !formData.kategori
            }
          >
            {operationLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Product Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tambah Produk Baru</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Produk *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nama: e.target.value }))
                    }
                    placeholder="Masukkan nama produk"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kategori *</Form.Label>
                  <Form.Select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        kategori: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deskripsi: e.target.value,
                  }))
                }
                placeholder="Masukkan deskripsi produk (opsional)"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harga Asli (IDR)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="100"
                    value={formData.original_price}
                    onChange={(e) =>
                      handleDiscountChange("original_price", e.target.value)
                    }
                    placeholder="Harga normal sebelum diskon"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diskon (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discount_percent}
                    onChange={(e) =>
                      handleDiscountChange("discount_percent", e.target.value)
                    }
                    placeholder="0"
                  />
                  {formData.discount_percent && formData.original_price && (
                    <Form.Text className="text-success">
                      Harga setelah diskon:{" "}
                      {helpers.formatCurrency(formData.harga)}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harga Jual (IDR) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="100"
                    value={formData.harga}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="0"
                    required
                  />
                  {formData.discount_percent > 0 && (
                    <Form.Text className="text-muted">
                      Harga dihitung otomatis dari diskon
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="available">Tersedia</option>
                    <option value="unavailable">Tidak Tersedia</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>URL Gambar</Form.Label>
              <Form.Control
                type="url"
                value={formData.gambar_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gambar_url: e.target.value,
                  }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Berakhir Promo</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        valid_until: e.target.value,
                      }))
                    }
                  />
                  <Form.Text className="text-muted">
                    Kosongkan jika promo tidak ada batas waktu
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Produk Promo"
                    checked={formData.is_promo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_promo: e.target.checked,
                      }))
                    }
                  />
                  <Form.Text className="text-muted">
                    Centang jika produk sedang dalam promo
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowCreateModal(false)}
          >
            Batal
          </Button>
          <Button
            className={styles.button}
            onClick={handleCreateNewProduct}
            disabled={
              operationLoading ||
              !formData.nama ||
              !formData.harga ||
              !formData.kategori
            }
          >
            {operationLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Menyimpan...
              </>
            ) : (
              "Tambah Produk"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductManagement;
