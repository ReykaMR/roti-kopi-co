const Order = require("../models/orderModel");
const pool = require("../config/database");

const orderController = {
  getAllOrders: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status, start_date, end_date } = req.query;

      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          error: "Parameter page dan limit harus valid (limit maksimal 100)",
        });
      }

      const result = await Order.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        start_date,
        end_date,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID pesanan tidak valid" });
      }

      const order = await Order.findById(parseInt(id));

      if (!order) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  },

  createOrder: async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const orderData = req.body;
      const userId = req.user?.userId;

      if (req.user?.role === "pelanggan") {
        if (orderData.customer_phone) {
          const normalizePhone = (phone) => {
            const cleaned = phone.toString().replace(/\D/g, "");
            if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
            if (cleaned.startsWith("62")) return cleaned;
            if (cleaned.startsWith("8")) return "62" + cleaned;
            return cleaned;
          };

          const normalizedPhone = normalizePhone(orderData.customer_phone);

          const [users] = await connection.execute(
            "SELECT user_id, nomor_telepon FROM users WHERE user_id = ?",
            [userId]
          );

          if (users.length > 0) {
            const userPhone = normalizePhone(users[0].nomor_telepon);
            if (userPhone !== normalizedPhone) {
              await connection.rollback();
              return res.status(403).json({
                error:
                  "Anda hanya dapat membuat pesanan untuk nomor telepon sendiri",
              });
            }
          }
        }

        const [userInfo] = await connection.execute(
          "SELECT nomor_telepon FROM users WHERE user_id = ?",
          [userId]
        );

        if (userInfo.length > 0) {
          orderData.customer_phone = userInfo[0].nomor_telepon;
        }
      }

      if (!orderData.customer_name || !orderData.customer_phone) {
        await connection.rollback();
        return res.status(400).json({
          error: "Nama dan telepon pelanggan harus diisi",
        });
      }

      if (
        !orderData.tipe_pesanan ||
        !["dine_in", "take_away"].includes(orderData.tipe_pesanan)
      ) {
        await connection.rollback();
        return res.status(400).json({
          error: "Tipe pesanan harus diisi dan valid (dine_in atau take_away)",
        });
      }

      if (
        !orderData.items ||
        !Array.isArray(orderData.items) ||
        orderData.items.length === 0
      ) {
        await connection.rollback();
        return res.status(400).json({
          error: "Pesanan harus memiliki minimal satu item",
        });
      }

      for (const item of orderData.items) {
        if (!item.product_id || !item.jumlah || !item.harga_satuan) {
          await connection.rollback();
          return res.status(400).json({
            error:
              "Setiap item harus memiliki product_id, jumlah, dan harga_satuan",
          });
        }

        if (item.jumlah < 1) {
          await connection.rollback();
          return res.status(400).json({
            error: "Jumlah item harus lebih dari 0",
          });
        }
      }

      let totalHarga = 0;
      orderData.items.forEach((item) => {
        const subtotal = parseFloat(item.harga_satuan) * parseInt(item.jumlah);
        totalHarga += subtotal;
      });

      const tipe = orderData.tipe_pesanan === "dine_in" ? "DI" : "TA";
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const nomorAntrian = `${tipe}${timestamp}${random}`;

      const completeOrderData = {
        user_id: userId,
        customer_name: orderData.customer_name.trim(),
        customer_phone: orderData.customer_phone.trim(),
        nomor_antrian: nomorAntrian,
        tipe_pesanan: orderData.tipe_pesanan,
        total_harga: totalHarga,
        notes: orderData.notes || null,
        items: orderData.items,
      };

      const orderId = await Order.create(completeOrderData, connection);

      await connection.commit();

      res.status(201).json({
        message: "Order berhasil dibuat",
        order_id: orderId,
        nomor_antrian: nomorAntrian,
        total_harga: totalHarga,
      });
    } catch (error) {
      await connection.rollback();

      if (error.code === "ER_DATA_TOO_LONG") {
        return res.status(400).json({
          error:
            "Data terlalu panjang untuk disimpan. Silakan hubungi administrator.",
        });
      }

      res.status(500).json({
        error: "Terjadi kesalahan server: " + error.message,
      });
    } finally {
      connection.release();
    }
  },

  updateOrderStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.userId;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID pesanan tidak valid" });
      }

      const validStatuses = ["pending", "processing", "completed", "cancelled"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          error:
            "Status tidak valid. Status yang valid: " +
            validStatuses.join(", "),
        });
      }

      const updated = await Order.updateStatus(
        parseInt(id),
        status,
        userId,
        notes
      );

      if (!updated) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      res.json({ message: "Status pesanan berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  },

  deleteOrder: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID pesanan tidak valid" });
      }

      const deleted = await Order.delete(parseInt(id));

      if (!deleted) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      res.json({ message: "Pesanan berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  },

  getSalesReport: async (req, res, next) => {
    try {
      const { start_date, end_date, group_by = "day" } = req.query;

      const validGroupBy = ["day", "month", "year"];
      if (!validGroupBy.includes(group_by)) {
        return res.status(400).json({
          error: "Group by tidak valid. Pilihan: day, month, year",
        });
      }

      const report = await Order.getSalesReport({
        start_date,
        end_date,
        group_by,
      });

      res.json(report);
    } catch (error) {
      next(error);
    }
  },

  getCustomerOrders: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10, status } = req.query;

      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          error: "Parameter page dan limit harus valid (limit maksimal 100)",
        });
      }

      const result = await Order.findByUserId(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getCustomerOrderDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID pesanan tidak valid" });
      }

      const order = await Order.findById(parseInt(id));

      if (!order) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      if (order.user_id !== userId) {
        return res
          .status(403)
          .json({ error: "Akses ditolak. Pesanan bukan milik Anda." });
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = orderController;
