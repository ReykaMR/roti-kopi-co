const pool = require("../config/database");

const Promo = {
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT *, 
             CASE 
               WHEN valid_until >= CURDATE() AND is_active = 1 THEN 'available'
               ELSE 'unavailable'
             END as availability_status
      FROM promos 
      ORDER BY created_at
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      `
      SELECT *, 
             CASE 
               WHEN valid_until >= CURDATE() AND is_active = 1 THEN 'available'
               ELSE 'unavailable'
             END as availability_status
      FROM promos 
      WHERE promo_id = ?
    `,
      [id]
    );
    return rows[0];
  },

  getProducts: async (promoId) => {
    const [rows] = await pool.query(
      `
      SELECT p.* 
      FROM promo_products pp
      JOIN products p ON pp.product_id = p.product_id
      WHERE pp.promo_id = ?
    `,
      [promoId]
    );
    return rows;
  },
};

module.exports = Promo;
