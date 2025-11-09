const pool = require("../config/database");

const Order = {
  findAll: async ({ page = 1, limit = 10, status, start_date, end_date }) => {
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.order_id, o.customer_name, o.customer_phone, o.nomor_antrian, 
             o.tipe_pesanan, o.waktu_pesan, o.waktu_selesai, o.status, 
             o.total_harga, u.nama as kasir_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o
      WHERE 1=1
    `;

    const params = [];
    const countParams = [];

    if (status) {
      query += ` AND o.status = ?`;
      countQuery += ` AND o.status = ?`;
      params.push(status);
      countParams.push(status);
    }

    if (start_date) {
      query += ` AND DATE(o.waktu_pesan) >= ?`;
      countQuery += ` AND DATE(o.waktu_pesan) >= ?`;
      params.push(start_date);
      countParams.push(start_date);
    }

    if (end_date) {
      query += ` AND DATE(o.waktu_pesan) <= ?`;
      countQuery += ` AND DATE(o.waktu_pesan) <= ?`;
      params.push(end_date);
      countParams.push(end_date);
    }

    query += ` ORDER BY o.waktu_pesan ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    try {
      const [orders] = await pool.query(query, params);
      const [totalResult] = await pool.query(countQuery, countParams);
      const total = totalResult[0].total;

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const [orders] = await pool.query(
        `SELECT o.*, u.nama as kasir_name 
         FROM orders o 
         LEFT JOIN users u ON o.user_id = u.user_id 
         WHERE o.order_id = ?`,
        [id]
      );

      if (orders.length === 0) {
        return null;
      }

      const order = orders[0];

      const [orderDetails] = await pool.query(
        `SELECT od.*, p.nama as product_name, p.gambar_url
         FROM order_details od 
         JOIN products p ON od.product_id = p.product_id 
         WHERE od.order_id = ?`,
        [id]
      );

      order.items = orderDetails;
      return order;
    } catch (error) {
      throw error;
    }
  },

  create: async (orderData, connection) => {
    try {
      const [orderResult] = await connection.execute(
        `INSERT INTO orders 
         (user_id, customer_name, customer_phone, nomor_antrian, tipe_pesanan, total_harga, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.user_id,
          orderData.customer_name,
          orderData.customer_phone,
          orderData.nomor_antrian,
          orderData.tipe_pesanan,
          orderData.total_harga,
          orderData.notes,
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of orderData.items) {
        await connection.execute(
          `INSERT INTO order_details 
           (order_id, product_id, jumlah, harga_satuan, subtotal) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.jumlah,
            item.harga_satuan,
            parseFloat(item.harga_satuan) * parseInt(item.jumlah),
          ]
        );
      }

      await connection.execute(
        `INSERT INTO order_status_history 
         (order_id, status, changed_by) 
         VALUES (?, 'pending', ?)`,
        [orderId, orderData.user_id || null]
      );

      return orderId;
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (id, status, userId, notes) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `UPDATE orders SET status = ?, waktu_selesai = CASE WHEN ? = 'completed' THEN NOW() ELSE waktu_selesai END 
         WHERE order_id = ?`,
        [status, status, id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      await connection.execute(
        `INSERT INTO order_status_history (order_id, status, changed_by, notes) 
         VALUES (?, ?, ?, ?)`,
        [id, status, userId, notes || null]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  delete: async (id) => {
    try {
      const [result] = await pool.query(
        "DELETE FROM orders WHERE order_id = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  findByUserId: async (userId, { page = 1, limit = 10, status } = {}) => {
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.order_id, o.customer_name, o.customer_phone, o.nomor_antrian, 
             o.tipe_pesanan, o.waktu_pesan, o.waktu_selesai, o.status, 
             o.total_harga, o.notes
      FROM orders o
      WHERE o.user_id = ?
    `;

    let countQuery = `SELECT COUNT(*) as total FROM orders o WHERE o.user_id = ?`;
    const params = [userId];
    const countParams = [userId];

    if (status) {
      query += ` AND o.status = ?`;
      countQuery += ` AND o.status = ?`;
      params.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY o.waktu_pesan ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    try {
      const [orders] = await pool.query(query, params);
      const [totalResult] = await pool.query(countQuery, countParams);
      const total = totalResult[0].total;

      for (let order of orders) {
        const [items] = await pool.query(
          `SELECT od.*, p.nama as product_name, p.gambar_url
           FROM order_details od 
           JOIN products p ON od.product_id = p.product_id 
           WHERE od.order_id = ?`,
          [order.order_id]
        );
        order.items = items;
      }

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  },

  getSalesReport: async ({ start_date, end_date, group_by = "day" } = {}) => {
    let dateFormat = "%Y-%m-%d";
    if (group_by === "month") {
      dateFormat = "%Y-%m";
    } else if (group_by === "year") {
      dateFormat = "%Y";
    }

    let query = `
      SELECT 
        DATE_FORMAT(waktu_pesan, ?) as period,
        COUNT(*) as total_orders,
        SUM(total_harga) as total_revenue,
        AVG(total_harga) as average_order_value
      FROM orders 
      WHERE status = 'completed'
    `;

    const params = [dateFormat];

    if (start_date) {
      query += ` AND DATE(waktu_pesan) >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND DATE(waktu_pesan) <= ?`;
      params.push(end_date);
    }

    query += ` GROUP BY period ORDER BY period ASC`;

    try {
      const [report] = await pool.query(query, params);
      return report;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Order;
