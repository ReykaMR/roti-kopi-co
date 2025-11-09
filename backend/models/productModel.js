const pool = require("../config/database");

const Product = {
  findAll: async ({ page = 1, limit = 10, category, search, status }) => {
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        product_id, nama, deskripsi, harga, original_price, 
        discount_percent, kategori, status, gambar_url, 
        is_promo, valid_until
      FROM products 
      WHERE 1=1
    `;

    let countQuery = `SELECT COUNT(*) as total FROM products WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (category) {
      query += ` AND kategori = ?`;
      countQuery += ` AND kategori = ?`;
      params.push(category);
      countParams.push(category);
    }

    if (status) {
      query += ` AND status = ?`;
      countQuery += ` AND status = ?`;
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      query += ` AND (nama LIKE ? OR deskripsi LIKE ?)`;
      countQuery += ` AND (nama LIKE ? OR deskripsi LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }

    query += ` ORDER BY product_id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    try {
      const [products] = await pool.query(query, params);
      const [totalResult] = await pool.query(countQuery, countParams);
      const total = totalResult[0].total;

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },

  findById: async (id) => {
    try {
      const [products] = await pool.query(
        "SELECT * FROM products WHERE product_id = ?",
        [id]
      );

      if (products.length === 0) {
        return null;
      }

      return products[0];
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },

  create: async (productData) => {
    const {
      nama,
      deskripsi,
      harga,
      kategori,
      status,
      gambar_url,
      original_price,
      discount_percent,
      is_promo,
      valid_until,
    } = productData;

    try {
      const [result] = await pool.query(
        `INSERT INTO products (
          nama, deskripsi, harga, kategori, status, gambar_url,
          original_price, discount_percent, is_promo, valid_until
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nama,
          deskripsi,
          harga,
          kategori,
          status || "available",
          gambar_url,
          original_price || null,
          discount_percent || null,
          is_promo ? 1 : 0,
          valid_until || null,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },

  update: async (id, productData) => {
    const {
      nama,
      deskripsi,
      harga,
      kategori,
      status,
      gambar_url,
      original_price,
      discount_percent,
      is_promo,
      valid_until,
    } = productData;

    try {
      const [result] = await pool.query(
        `UPDATE products SET 
          nama = ?, deskripsi = ?, harga = ?, kategori = ?, status = ?, gambar_url = ?,
          original_price = ?, discount_percent = ?, is_promo = ?, valid_until = ?
         WHERE product_id = ?`,
        [
          nama,
          deskripsi,
          harga,
          kategori,
          status,
          gambar_url,
          original_price || null,
          discount_percent || null,
          is_promo ? 1 : 0,
          valid_until || null,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },

  delete: async (id) => {
    try {
      const [result] = await pool.query(
        "DELETE FROM products WHERE product_id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },

  // Additional method to get promo products
  findPromoProducts: async () => {
    try {
      const [products] = await pool.query(
        "SELECT * FROM products WHERE is_promo = 1 AND status = 'available' AND (valid_until IS NULL OR valid_until >= CURDATE())"
      );
      return products;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },

  // Method to update product status based on promo expiry
  updateExpiredPromos: async () => {
    try {
      const [result] = await pool.query(
        "UPDATE products SET is_promo = 0, discount_percent = NULL, original_price = NULL WHERE valid_until < CURDATE() AND is_promo = 1"
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },
};

module.exports = Product;
