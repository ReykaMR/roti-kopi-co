const pool = require("../config/database");

const SpecialEvent = {
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT * FROM special_events 
      WHERE is_active = 1 
      ORDER BY created_at ASC
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      `
      SELECT * FROM special_events 
      WHERE event_id = ? AND is_active = 1
    `,
      [id]
    );
    return rows[0];
  },
};

module.exports = SpecialEvent;
