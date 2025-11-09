const express = require("express");
const router = express.Router();
const promoController = require("../controllers/promoController");

router.get("/", promoController.getAllPromos);
router.get("/:id", promoController.getPromoById);
router.get("/:id/products", promoController.getPromoProducts);

module.exports = router;
