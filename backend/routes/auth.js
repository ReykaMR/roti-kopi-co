const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

router.post("/admin-login", authController.loginAdmin);

router.get("/me", authenticateToken, authController.getCurrentUser);

module.exports = router;
