const pool = require("../config/database");
const bcrypt = require("bcryptjs");

const User = {
  findAll: async ({ page = 1, limit = 10, role, search }) => {
    const offset = (page - 1) * limit;

    let query = `SELECT user_id, nama, email, nomor_telepon, role, created_at, last_login, is_active FROM users WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (role) {
      query += ` AND role = ?`;
      countQuery += ` AND role = ?`;
      params.push(role);
      countParams.push(role);
    }

    if (search) {
      query += ` AND (nama LIKE ? OR email LIKE ? OR nomor_telepon LIKE ?)`;
      countQuery += ` AND (nama LIKE ? OR email LIKE ? OR nomor_telepon LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY created_at ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(query, params);
    const [totalResult] = await pool.query(countQuery, countParams);
    const total = totalResult[0].total;

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id) => {
    const [users] = await pool.query(
      `SELECT user_id, nama, email, nomor_telepon, role, created_at, last_login, is_active 
       FROM users WHERE user_id = ?`,
      [id]
    );

    return users[0];
  },

  create: async (userData) => {
    const { nama, email, nomor_telepon, role, password } = userData;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (nama, email, nomor_telepon, role, password_hash) 
       VALUES (?, ?, ?, ?, ?)`,
      [nama, email, nomor_telepon, role, password_hash]
    );

    return result.insertId;
  },

  update: async (id, userData) => {
    const { nama, email, nomor_telepon, role, is_active } = userData;

    const [result] = await pool.query(
      `UPDATE users SET nama = ?, email = ?, nomor_telepon = ?, role = ?, is_active = ? 
       WHERE user_id = ?`,
      [nama, email, nomor_telepon, role, is_active, id]
    );

    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [
      id,
    ]);

    return result.affectedRows > 0;
  },
};

module.exports = User;
