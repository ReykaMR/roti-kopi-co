const User = require("../models/userModel");
const pool = require("../config/database");
const bcrypt = require("bcryptjs");

const userController = {
  getAllUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, role, search } = req.query;

      const result = await User.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        search,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const { nama, email, nomor_telepon, role, password } = req.body;

      if (!nama || !email || !nomor_telepon || !role || !password) {
        return res.status(400).json({ error: "Semua field wajib diisi" });
      }

      if (!["admin", "kasir", "pelanggan"].includes(role)) {
        return res.status(400).json({ error: "Role tidak valid" });
      }

      const normalizePhoneNumber = (phone) => {
        if (!phone) return phone;

        const cleaned = phone.toString().replace(/\D/g, "");

        if (cleaned.startsWith("0")) {
          return "62" + cleaned.slice(1);
        } else if (cleaned.startsWith("62")) {
          return cleaned;
        } else if (cleaned.startsWith("8")) {
          return "62" + cleaned;
        }

        return cleaned;
      };

      const normalizedPhone = normalizePhoneNumber(nomor_telepon);

      if (!/^62[0-9]{9,13}$/.test(normalizedPhone)) {
        return res
          .status(400)
          .json({ error: "Format nomor telepon tidak valid" });
      }

      const userId = await User.create({
        nama,
        email,
        nomor_telepon: normalizedPhone,
        role,
        password,
      });

      res.status(201).json({
        message: "User berhasil dibuat",
        user_id: userId,
      });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nama, email, nomor_telepon, role, is_active } = req.body;

      if (!nama || !email || !nomor_telepon || !role) {
        return res.status(400).json({ error: "Semua field wajib diisi" });
      }

      if (!["admin", "kasir", "pelanggan"].includes(role)) {
        return res.status(400).json({ error: "Role tidak valid" });
      }

      if (parseInt(id) === req.user.userId && role !== req.user.role) {
        return res
          .status(400)
          .json({ error: "Tidak dapat mengubah role sendiri" });
      }

      const normalizePhoneNumber = (phone) => {
        if (!phone) return phone;

        const cleaned = phone.toString().replace(/\D/g, "");

        if (cleaned.startsWith("0")) {
          return "62" + cleaned.slice(1);
        } else if (cleaned.startsWith("62")) {
          return cleaned;
        } else if (cleaned.startsWith("8")) {
          return "62" + cleaned;
        }

        return cleaned;
      };

      const normalizedPhone = normalizePhoneNumber(nomor_telepon);

      if (!/^62[0-9]{9,13}$/.test(normalizedPhone)) {
        return res
          .status(400)
          .json({ error: "Format nomor telepon tidak valid" });
      }

      const updated = await User.update(id, {
        nama,
        email,
        nomor_telepon: normalizedPhone,
        role,
        is_active,
      });

      if (!updated) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      res.json({ message: "User berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (parseInt(id) === req.user.userId) {
        return res
          .status(400)
          .json({ error: "Tidak dapat menghapus akun sendiri" });
      }

      const deleted = await User.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      res.json({ message: "User berhasil dihapus" });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { nama, email, nomor_telepon } = req.body;

      if (!nama || !email || !nomor_telepon) {
        return res.status(400).json({ error: "Semua field wajib diisi" });
      }

      let targetUserId = userId;

      if (req.user.role === "admin" && req.body.user_id) {
        targetUserId = req.body.user_id;
      }

      const normalizePhoneNumber = (phone) => {
        if (!phone) return phone;

        const cleaned = phone.toString().replace(/\D/g, "");

        if (cleaned.startsWith("0")) {
          return "62" + cleaned.slice(1);
        } else if (cleaned.startsWith("62")) {
          return cleaned;
        } else if (cleaned.startsWith("8")) {
          return "62" + cleaned;
        }

        return cleaned;
      };

      const normalizedPhone = normalizePhoneNumber(nomor_telepon);

      if (!/^62[0-9]{9,13}$/.test(normalizedPhone)) {
        return res
          .status(400)
          .json({ error: "Format nomor telepon tidak valid" });
      }

      const [existingEmail] = await pool.query(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
        [email, targetUserId]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }

      const [existingPhone] = await pool.query(
        "SELECT user_id FROM users WHERE nomor_telepon = ? AND user_id != ?",
        [normalizedPhone, targetUserId]
      );

      if (existingPhone.length > 0) {
        return res.status(400).json({ error: "Nomor telepon sudah digunakan" });
      }

      const [result] = await pool.query(
        "UPDATE users SET nama = ?, email = ?, nomor_telepon = ? WHERE user_id = ?",
        [nama, email, normalizedPhone, targetUserId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      const [updatedUser] = await pool.query(
        "SELECT user_id, nama, email, nomor_telepon, role, created_at, last_login, is_active, password_hash FROM users WHERE user_id = ?",
        [targetUserId]
      );

      res.json({
        message: "Profil berhasil diperbarui",
        user: {
          ...updatedUser[0],
          has_password:
            updatedUser[0].password_hash !== null &&
            updatedUser[0].password_hash !== undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { current_password, new_password, is_initial_setup } = req.body;

      // console.log("Change password request:", {
      //   userId,
      //   is_initial_setup,
      //   hasCurrentPassword: !!current_password,
      // });

      if (!new_password) {
        return res.status(400).json({ error: "Password baru harus diisi" });
      }

      let targetUserId = userId;

      if (req.user.role === "admin" && req.body.user_id) {
        targetUserId = req.body.user_id;
      }

      const [users] = await pool.query(
        "SELECT * FROM users WHERE user_id = ?",
        [targetUserId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: "User tidak ditemukan" });
      }

      const user = users[0];
      // console.log("User found:", {
      //   userId: user.user_id,
      //   hasPasswordHash: !!user.password_hash,
      //   passwordHashLength: user.password_hash ? user.password_hash.length : 0,
      // });

      if (is_initial_setup) {
        console.log("Initial password setup for user:", targetUserId);
      } else if (user.password_hash) {
        if (!current_password) {
          return res
            .status(400)
            .json({ error: "Password saat ini harus diisi" });
        }

        const isPasswordValid = await bcrypt.compare(
          current_password,
          user.password_hash
        );
        if (!isPasswordValid) {
          return res.status(400).json({ error: "Password saat ini salah" });
        }
      } else {
        return res.status(400).json({
          error: "Silakan gunakan opsi setup password pertama kali",
        });
      }

      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(new_password, saltRounds);
      // console.log("New password hash created, length:", newPasswordHash.length);

      await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
        newPasswordHash,
        targetUserId,
      ]);

      // console.log("Password updated successfully for user:", targetUserId);

      const [updatedUsers] = await pool.query(
        "SELECT user_id, nama, email, nomor_telepon, role, created_at, last_login, is_active, password_hash FROM users WHERE user_id = ?",
        [targetUserId]
      );

      const updatedUser = updatedUsers[0];
      // console.log("After update - has_password:", !!updatedUser.password_hash);

      res.json({
        message: "Password berhasil diubah",
        is_initial_setup: is_initial_setup || false,
        user: {
          user_id: updatedUser.user_id,
          nama: updatedUser.nama,
          email: updatedUser.email,
          nomor_telepon: updatedUser.nomor_telepon,
          role: updatedUser.role,
          created_at: updatedUser.created_at,
          last_login: updatedUser.last_login,
          is_active: updatedUser.is_active,
          has_password: !!updatedUser.password_hash,
        },
      });
    } catch (error) {
      // console.error("Error in changePassword:", error);
      next(error);
    }
  },
};

module.exports = userController;
