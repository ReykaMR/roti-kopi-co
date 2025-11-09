const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const {
  authenticateToken,
  authorize,
  checkPermission,
} = require("../middleware/auth");

router.get("/", productController.getAllProducts);
router.get("/promo", productController.getPromoProducts);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_products"),
  productController.createProduct
);

router.put(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_products"),
  productController.updateProduct
);

router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_products"),
  productController.deleteProduct
);

router.post(
  "/promo/update-expired",
  authenticateToken,
  authorize(["admin"]),
  checkPermission("manage_products"),
  productController.updateExpiredPromos
);

module.exports = router;
