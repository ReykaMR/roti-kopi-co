const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const {
  authenticateToken,
  authorize,
  checkPermission,
} = require("../middleware/auth");

router.post(
  "/qris",
  authenticateToken,
  authorize(["admin", "kasir", "pelanggan"]),
  checkPermission("place_orders"),
  paymentController.generateQRIS
);

router.get(
  "/customer/:payment_id",
  authenticateToken,
  authorize(["pelanggan"]),
  paymentController.getCustomerPaymentStatus
);

router.get(
  "/:payment_id",
  authenticateToken,
  authorize(["admin", "kasir", "pelanggan"]),
  checkPermission("view_payments"),
  paymentController.checkPaymentStatus
);

router.post(
  "/simulate",
  authenticateToken,
  authorize(["admin", "kasir"]),
  checkPermission("manage_orders"),
  paymentController.simulatePayment
);

router.get(
  "/status/:order_id",
  authenticateToken,
  authorize(["admin", "kasir", "pelanggan"]),
  checkPermission("view_orders"),
  paymentController.getPaymentStatusByOrderId
);

router.put(
  "/:payment_id/status",
  authenticateToken,
  authorize(["admin", "kasir"]),
  checkPermission("manage_payments"),
  paymentController.updatePaymentStatus
);

module.exports = router;
