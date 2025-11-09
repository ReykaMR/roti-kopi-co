const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const normalizePhoneNumber = (phone) => {
  if (!phone) return phone;

  const cleaned = phone.toString().replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    return "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("62")) {
    return cleaned;
  } else if (cleaned.startsWith("8")) {
    return "62" + cleaned;
  } else if (cleaned.startsWith("+62")) {
    return cleaned.slice(1);
  }

  return cleaned;
};

const otpController = {
  requestOTP: async (req, res, next) => {
    try {
      const { phone } = req.body;

      if (!phone || !/^[0-9]{9,15}$/.test(phone)) {
        return res.status(400).json({ error: "Nomor telepon tidak valid" });
      }

      const normalizedPhone = normalizePhoneNumber(phone);

      // console.log(
      //   `Request OTP - Nomor: ${phone} -> Normalized: ${normalizedPhone}`
      // );

      const [existingUsers] = await pool.query(
        "SELECT user_id, is_active FROM users WHERE nomor_telepon = ?",
        [normalizedPhone]
      );

      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        if (user.is_active !== undefined && !user.is_active) {
          return res.status(403).json({
            error:
              "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.",
          });
        }
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      let userId;

      if (existingUsers.length === 0) {
        const [result] = await pool.query(
          'INSERT INTO users (nomor_telepon, role, is_active) VALUES (?, "pelanggan", 1)',
          [normalizedPhone]
        );
        userId = result.insertId;
      } else {
        userId = existingUsers[0].user_id;
      }

      await pool.query(
        `INSERT INTO user_otps (user_id, kode_otp, expired_at) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
        [userId, otp]
      );

      res.json({
        message: "OTP berhasil dikirim",
        otp: otp,
      });
    } catch (error) {
      res.status(500).json({ error: "Terjadi kesalahan server" });
    }
  },

  verifyOTP: async (req, res, next) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res
          .status(400)
          .json({ error: "Nomor telepon dan OTP harus diisi" });
      }

      const normalizedPhone = normalizePhoneNumber(phone);

      const [otps] = await pool.query(
        `SELECT uot.*, u.user_id, u.nama, u.email, u.role, u.created_at, u.last_login, u.is_active, u.password_hash 
       FROM user_otps uot
       JOIN users u ON uot.user_id = u.user_id
       WHERE u.nomor_telepon = ? AND uot.kode_otp = ? AND uot.is_used = 0 AND uot.expired_at > NOW()`,
        [normalizedPhone, otp]
      );

      if (otps.length === 0) {
        return res
          .status(400)
          .json({ error: "OTP tidak valid atau telah kadaluarsa" });
      }

      const otpRecord = otps[0];

      if (otpRecord.is_active !== undefined && !otpRecord.is_active) {
        return res.status(403).json({
          error:
            "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.",
        });
      }

      await pool.query(
        `UPDATE users SET last_login = NOW() WHERE user_id = ?`,
        [otpRecord.user_id]
      );

      await pool.query(`UPDATE user_otps SET is_used = 1 WHERE otp_id = ?`, [
        otpRecord.otp_id,
      ]);

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET tidak terdefinisi");
      }

      const token = jwt.sign(
        {
          userId: otpRecord.user_id,
          phone: normalizedPhone,
          role: otpRecord.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const userResponse = {
        user_id: otpRecord.user_id,
        nama: otpRecord.nama || "Pelanggan",
        email: otpRecord.email || "",
        nomor_telepon: normalizedPhone,
        role: otpRecord.role || "pelanggan",
        created_at: otpRecord.created_at,
        last_login: new Date().toISOString(),
        is_active: otpRecord.is_active !== undefined ? otpRecord.is_active : 1,
        has_password:
          otpRecord.password_hash !== null &&
          otpRecord.password_hash !== undefined,
      };

      res.json({
        message: "OTP verified successfully",
        user: userResponse,
        token: token,
      });
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      res
        .status(500)
        .json({ error: "Terjadi kesalahan server: " + error.message });
    }
  },
};

module.exports = otpController;
