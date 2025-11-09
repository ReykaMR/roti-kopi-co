const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const authController = {
  loginAdmin: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email dan password diperlukan" });
      }

      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ? AND role IN ("admin", "kasir")',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: "Email atau password salah" });
      }

      const user = users[0];

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Email atau password salah" });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: "Akun tidak aktif" });
      }

      const token = jwt.sign(
        {
          userId: user.user_id,
          role: user.role,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      await pool.query(
        "UPDATE users SET last_login = NOW() WHERE user_id = ?",
        [user.user_id]
      );

      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        message: "Login berhasil",
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  },

  getCurrentUser: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const [users] = await pool.query(
        "SELECT user_id, nama, email, nomor_telepon, role, created_at, last_login, is_active, password_hash FROM users WHERE user_id = ?",
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      const user = users[0];

      if (user.is_active !== undefined && !user.is_active) {
        return res.status(403).json({
          error:
            "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.",
        });
      }

      res.json({
        user_id: user.user_id,
        nama: user.nama,
        email: user.email,
        nomor_telepon: user.nomor_telepon,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        is_active: user.is_active,
        has_password:
          user.password_hash !== null && user.password_hash !== undefined,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
