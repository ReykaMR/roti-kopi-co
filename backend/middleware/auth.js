const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token diperlukan" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token tidak valid" });
    }
    req.user = user;
    next();
  });
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "User tidak terautentikasi" });
    }

    if (roles.length === 0) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Akses ditolak. Role tidak diizinkan." });
    }
    next();
  };
};

const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User tidak terautentikasi" });
      }

      const adminPermissions = [
        "view_orders",
        "manage_orders",
        "view_reports",
        "manage_products",
        "manage_users",
        "view_payments",
        "manage_payments",
      ];

      const kasirPermissions = [
        "view_orders",
        "manage_orders",
        "place_orders",
        "view_payments",
        "manage_payments",
      ];

      const pelangganPermissions = [
        "place_orders",
        "view_own_orders",
        "view_own_payments",
      ];

      let hasPermission = false;

      switch (req.user.role) {
        case "admin":
          hasPermission = adminPermissions.includes(permission);
          break;
        case "kasir":
          hasPermission = kasirPermissions.includes(permission);
          break;
        case "pelanggan":
          if (permission === "view_orders") {
            hasPermission = true;
          } else if (permission === "view_payments") {
            hasPermission = true;
          } else {
            hasPermission = pelangganPermissions.includes(permission);
          }
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        return res
          .status(403)
          .json({ error: "Tidak memiliki izin untuk aksi ini" });
      }

      next();
    } catch (error) {
      res
        .status(500)
        .json({ error: "Kesalahan server selama pemeriksaan izin" });
    }
  };
};

module.exports = { authenticateToken, authorize, checkPermission };
