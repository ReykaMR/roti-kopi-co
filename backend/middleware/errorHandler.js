const errorHandler = (err, req, res, next) => {
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Data sudah ada" });
  }

  if (err.code === "ER_NO_REFERENCED_ROW") {
    return res.status(400).json({ error: "Data referensi tidak ditemukan" });
  }

  if (err.code === "ER_BAD_NULL_ERROR") {
    return res.status(400).json({ error: "Data wajib tidak boleh kosong" });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Token tidak valid" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token telah kadaluarsa" });
  }

  res.status(500).json({
    error: "Terjadi kesalahan server",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

module.exports = errorHandler;
