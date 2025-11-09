const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const {
  authenticateToken,
  authorize,
  checkPermission,
} = require("../middleware/auth");

router.get(
  "/",
  authenticateToken,
  authorize(["admin", "kasir"]),
  checkPermission("view_orders"),
  orderController.getAllOrders
);

router.get(
  "/:id",
  authenticateToken,
  authorize(["admin", "kasir"]),
  checkPermission("view_orders"),
  orderController.getOrderById
);

router.get(
  "/customer/orders",
  authenticateToken,
  authorize(["pelanggan"]),
  orderController.getCustomerOrders
);

router.get(
  "/customer/orders/:id",
  authenticateToken,
  authorize(["pelanggan"]),
  orderController.getCustomerOrderDetail
);

router.post(
  "/",
  authenticateToken,
  authorize(["admin", "kasir", "pelanggan"]),
  checkPermission("place_orders"),
  orderController.createOrder
);

router.put(
  "/:id/status",
  authenticateToken,
  authorize(["admin", "kasir"]),
  checkPermission("manage_orders"),
  orderController.updateOrderStatus
);

router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_orders"),
  orderController.deleteOrder
);

router.get(
  "/reports/sales",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("view_reports"),
  orderController.getSalesReport
);

router.get(
  "/customer/:id",
  authenticateToken,
  authorize(["pelanggan"]),
  orderController.getCustomerOrderDetail
);

module.exports = router;
