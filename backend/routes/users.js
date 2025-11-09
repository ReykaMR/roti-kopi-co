const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorize,
  checkPermission,
} = require("../middleware/auth");

router.put(
  "/profile",
  authenticateToken,
  authorize(["pelanggan", "admin"]),
  userController.updateProfile
);

router.put(
  "/change-password",
  authenticateToken,
  authorize(["pelanggan", "admin"]),
  userController.changePassword
);

router.get(
  "/",
  authenticateToken,
  authorize(["admin", "kasir"]),
  checkPermission("manage_users"),
  userController.getAllUsers
);

router.get(
  "/:id",
  authenticateToken,
  authorize(["admin", "kasir"]),
  checkPermission("manage_users"),
  userController.getUserById
);

router.post(
  "/",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_users"),
  userController.createUser
);

router.put(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_users"),
  userController.updateUser
);

router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_users"),
  userController.deleteUser
);

module.exports = router;
