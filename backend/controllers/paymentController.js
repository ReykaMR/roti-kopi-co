const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/database");

const generateQRISString = (paymentData) => {
  const {
    payment_id,
    amount,
    merchant_name = "Roti & Kopi Co",
    merchant_city = "Jakarta",
  } = paymentData;

  const emvCoData = [
    { id: "00", value: "01" },
    { id: "01", value: "12" },
    { id: "52", value: "0000" },
    { id: "53", value: "360" },
    { id: "54", value: amount.toFixed(2) },
    { id: "58", value: "ID" },
    { id: "59", value: merchant_name.substring(0, 25) },
    { id: "60", value: merchant_city.substring(0, 15) },
    { id: "62", value: `08${payment_id.substring(0, 20)}` },
  ];

  return emvCoData
    .map(
      (item) =>
        `${item.id}${item.value.length.toString().padStart(2, "0")}${
          item.value
        }`
    )
    .join("");
};

const paymentController = {
  generateQRIS: async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { order_id, amount } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!order_id || !amount) {
        await connection.rollback();
        return res
          .status(400)
          .json({ error: "Order ID dan amount harus diisi" });
      }

      if (isNaN(amount) || parseFloat(amount) <= 0) {
        await connection.rollback();
        return res
          .status(400)
          .json({ error: "Amount harus berupa angka positif" });
      }

      const [orders] = await connection.query(
        `SELECT o.*, u.nomor_telepon 
         FROM orders o 
         LEFT JOIN users u ON o.user_id = u.user_id 
         WHERE o.order_id = ?`,
        [order_id]
      );

      if (orders.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Order tidak ditemukan" });
      }

      const order = orders[0];

      if (userRole === "pelanggan" && order.user_id !== userId) {
        await connection.rollback();
        return res
          .status(403)
          .json({ error: "Anda tidak memiliki akses ke order ini" });
      }

      if (Math.abs(parseFloat(amount) - parseFloat(order.total_harga)) > 100) {
        await connection.rollback();
        return res.status(400).json({
          error: `Jumlah pembayaran (${helpers.formatCurrency(
            amount
          )}) tidak sesuai dengan total order (${helpers.formatCurrency(
            order.total_harga
          )})`,
        });
      }

      const [existingPayments] = await connection.query(
        `SELECT payment_id, status FROM payments 
         WHERE order_id = ? AND status IN ('unpaid', 'pending') 
         AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [order_id]
      );

      let payment_id;

      if (existingPayments.length > 0) {
        payment_id = existingPayments[0].payment_id;

        await connection.query(
          `UPDATE payments SET created_at = NOW() WHERE payment_id = ?`,
          [payment_id]
        );
      } else {
        payment_id = `QRIS-${Date.now()}-${uuidv4().substring(0, 8)}`;

        await connection.query(
          `INSERT INTO payments (payment_id, order_id, metode, jumlah_bayar, status, created_by, expires_at) VALUES (?, ?, 'qris', ?, 'unpaid', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
          [payment_id, order_id, amount, userId]
        );
      }

      const qrisString = generateQRISString({
        payment_id: payment_id,
        amount: parseFloat(amount),
        merchant_name: "Roti & Kopi Co",
        merchant_city: "Jakarta",
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrisString, {
        width: 300,
        height: 300,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const expires_at = new Date(Date.now() + 15 * 60 * 1000);

      await connection.commit();

      res.status(200).json({
        success: true,
        message: "QRIS berhasil digenerate",
        payment_id: payment_id,
        order_id: order_id,
        amount: parseFloat(amount),
        qr_code: qrCodeDataURL,
        qris_string: qrisString,
        expires_at: expires_at.toISOString(),
        merchant: {
          name: "Roti & Kopi Co",
          city: "Jakarta",
        },
      });
    } catch (error) {
      await connection.rollback();
      // console.error("Error in generateQRIS:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "Payment sudah ada untuk order ini" });
      }

      res.status(500).json({
        error: "Terjadi kesalahan server: " + error.message,
      });
    } finally {
      connection.release();
    }
  },

  checkPaymentStatus: async (req, res, next) => {
    try {
      const { payment_id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!payment_id) {
        return res.status(400).json({ error: "Payment ID harus diisi" });
      }

      let query = `
        SELECT p.*, o.total_harga, o.user_id as order_user_id,
               o.customer_name, o.nomor_antrian, o.tipe_pesanan,
               TIMESTAMPDIFF(SECOND, NOW(), p.expires_at) as seconds_remaining
        FROM payments p 
        JOIN orders o ON p.order_id = o.order_id 
        WHERE p.payment_id = ?
      `;

      const params = [payment_id];

      if (userRole === "pelanggan") {
        query += ` AND o.user_id = ?`;
        params.push(userId);
      }

      const [payments] = await pool.query(query, params);

      if (payments.length === 0) {
        if (userRole === "pelanggan") {
          return res.status(404).json({
            error: "Payment tidak ditemukan atau bukan milik Anda",
          });
        }
        return res.status(404).json({ error: "Payment tidak ditemukan" });
      }

      const payment = payments[0];

      if (payment.status === "unpaid" && payment.seconds_remaining < 0) {
        await pool.query(
          `UPDATE payments SET status = 'expired' WHERE payment_id = ?`,
          [payment_id]
        );
        payment.status = "expired";
      }

      const response = {
        payment_id: payment.payment_id,
        order_id: payment.order_id,
        status: payment.status,
        amount: parseFloat(payment.jumlah_bayar),
        total_order: parseFloat(payment.total_harga),
        paid_at: payment.waktu_bayar,
        method: payment.metode,
        created_at: payment.created_at,
        expires_at: payment.expires_at,
        order_info: {
          customer_name: payment.customer_name,
          nomor_antrian: payment.nomor_antrian,
          tipe_pesanan: payment.tipe_pesanan,
        },
      };

      res.json(response);
    } catch (error) {
      // console.error("Error in checkPaymentStatus:", error);
      res.status(500).json({
        error: "Terjadi kesalahan server: " + error.message,
      });
    }
  },

  simulatePayment: async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { payment_id } = req.body;
      const userId = req.user.userId;

      if (!payment_id) {
        await connection.rollback();
        return res.status(400).json({ error: "Payment ID harus diisi" });
      }

      const [payments] = await connection.query(
        `SELECT p.*, o.user_id as order_user_id 
         FROM payments p 
         JOIN orders o ON p.order_id = o.order_id 
         WHERE p.payment_id = ?`,
        [payment_id]
      );

      if (payments.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Payment tidak ditemukan" });
      }

      const payment = payments[0];

      if (req.user.role === "pelanggan" && payment.order_user_id !== userId) {
        await connection.rollback();
        return res.status(403).json({
          error: "Anda tidak memiliki akses untuk mensimulasikan payment ini",
        });
      }

      if (payment.status !== "unpaid") {
        await connection.rollback();
        return res.status(400).json({
          error: `Payment sudah dalam status: ${payment.status}`,
        });
      }

      const [result] = await connection.query(
        `UPDATE payments 
         SET status = 'paid', waktu_bayar = NOW() 
         WHERE payment_id = ? AND status = 'unpaid'`,
        [payment_id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res
          .status(400)
          .json({ error: "Gagal mengupdate status payment" });
      }

      await connection.query(
        `UPDATE orders SET status = 'processing' WHERE order_id = ?`,
        [payment.order_id]
      );

      await connection.query(
        `INSERT INTO order_status_history 
         (order_id, status, changed_by, notes) 
         VALUES (?, 'processing', ?, 'Pembayaran berhasil via QRIS (simulasi)')`,
        [payment.order_id, userId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: "Pembayaran berhasil disimulasikan",
        payment_id: payment_id,
        status: "paid",
        simulated_by: userId,
      });
    } catch (error) {
      await connection.rollback();
      // console.error("Error in simulatePayment:", error);
      res.status(500).json({
        error: "Terjadi kesalahan server: " + error.message,
      });
    } finally {
      connection.release();
    }
  },

  getPaymentStatusByOrderId: async (req, res, next) => {
    try {
      const { order_id } = req.params;

      const [payments] = await pool.query(
        `SELECT p.*, o.total_harga 
       FROM payments p 
       JOIN orders o ON p.order_id = o.order_id 
       WHERE p.order_id = ? 
       ORDER BY p.created_at ASC
       LIMIT 1`,
        [order_id]
      );

      if (payments.length === 0) {
        return res
          .status(404)
          .json({ error: "Payment tidak ditemukan untuk order ini" });
      }

      const payment = payments[0];

      res.json({
        payment_id: payment.payment_id,
        order_id: payment.order_id,
        status: payment.status,
        amount: payment.jumlah_bayar,
        total_order: payment.total_harga,
        paid_at: payment.waktu_bayar,
        method: payment.metode,
      });
    } catch (error) {
      res.status(500).json({
        error: "Terjadi kesalahan server: " + error.message,
      });
    }
  },
};

paymentController.getCustomerPaymentStatus = async (req, res, next) => {
  try {
    const { payment_id } = req.params;
    const userId = req.user.userId;

    const [payments] = await pool.query(
      `SELECT p.*, o.total_harga, o.user_id as order_user_id
       FROM payments p 
       JOIN orders o ON p.order_id = o.order_id 
       WHERE p.payment_id = ? AND o.user_id = ?`,
      [payment_id, userId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        error: "Payment tidak ditemukan atau bukan milik Anda",
      });
    }

    const payment = payments[0];

    res.json({
      payment_id: payment.payment_id,
      order_id: payment.order_id,
      status: payment.status,
      amount: payment.jumlah_bayar,
      total_order: payment.total_harga,
      paid_at: payment.waktu_bayar,
      method: payment.metode,
      created_at: payment.created_at,
    });
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan server: " + error.message,
    });
  }
};

paymentController.updatePaymentStatus = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { payment_id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!payment_id || !status) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Payment ID dan status diperlukan" });
    }

    const validStatuses = ["paid", "unpaid", "cancelled"];
    if (!validStatuses.includes(status)) {
      await connection.rollback();
      return res.status(400).json({
        error: "Status tidak valid. Status yang valid: paid, unpaid, cancelled",
      });
    }

    const [payments] = await connection.query(
      "SELECT * FROM payments WHERE payment_id = ?",
      [payment_id]
    );

    if (payments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Payment tidak ditemukan" });
    }

    const payment = payments[0];

    const [result] = await connection.query(
      `UPDATE payments 
       SET status = ?, waktu_bayar = CASE WHEN ? = 'paid' THEN NOW() ELSE NULL END 
       WHERE payment_id = ?`,
      [status, status, payment_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Gagal mengupdate status payment" });
    }

    if (status === "paid") {
      await connection.query(
        `UPDATE orders SET status = 'processing' WHERE order_id = ?`,
        [payment.order_id]
      );

      await connection.query(
        `INSERT INTO order_status_history 
         (order_id, status, changed_by, notes) 
         VALUES (?, 'processing', ?, 'Pembayaran dikonfirmasi oleh staff')`,
        [payment.order_id, userId]
      );
    }

    if (status === "unpaid" || status === "cancelled") {
      await connection.query(
        `UPDATE orders SET status = 'pending' WHERE order_id = ?`,
        [payment.order_id]
      );

      await connection.query(
        `INSERT INTO order_status_history 
         (order_id, status, changed_by, notes) 
         VALUES (?, 'pending', ?, 'Status pembayaran direset oleh staff')`,
        [payment.order_id, userId]
      );
    }

    await connection.commit();

    const [updatedPayments] = await connection.query(
      `SELECT p.*, o.total_harga 
       FROM payments p 
       JOIN orders o ON p.order_id = o.order_id 
       WHERE p.payment_id = ?`,
      [payment_id]
    );

    res.json({
      message: "Status pembayaran berhasil diperbarui",
      payment: updatedPayments[0],
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = paymentController;
