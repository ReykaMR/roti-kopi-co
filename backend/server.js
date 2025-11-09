const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const errorHandler = require("./middleware/errorHandler");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use((req, res, next) => {
  // console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const authRoutes = require("./routes/auth");
const otpRoutes = require("./routes/otp");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const promoRoutes = require("./routes/promos");
const specialEventRoutes = require("./routes/specialEvents");
const paymentRoutes = require("./routes/payments");

app.use("/api/auth", authRoutes);
app.use("/api/auth", otpRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/special-events", specialEventRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
