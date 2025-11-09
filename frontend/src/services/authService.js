import api from "./api";

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

export const authService = {
  loginAdmin: async (email, password) => {
    try {
      const response = await api.post("/auth/admin-login", {
        email,
        password,
      });

      if (response.data && response.data.token && response.data.user) {
        if (!["admin", "kasir"].includes(response.data.user.role)) {
          throw new Error("Role tidak diizinkan untuk login sebagai staff");
        }

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));

        return response.data;
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Email atau password salah");
      } else if (error.response?.status === 403) {
        throw new Error("Akses ditolak. Role tidak diizinkan.");
      } else if (error.code === "ERR_NETWORK") {
        throw new Error("Tidak dapat terhubung ke server");
      }

      throw error;
    }
  },

  requestOTP: async (phoneNumber) => {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      // console.log(
      //   `Request OTP - Original: ${phoneNumber}, Normalized: ${normalizedPhone}`
      // );

      const response = await api.post("/auth/request-otp", {
        phone: normalizedPhone,
      });

      const responseData = response.data;

      if (responseData.otp) {
        console.log(
          `%cOTP untuk ${normalizedPhone}: ${responseData.otp}`,
          "background: #4e342e; color: #ffffff; font-size: 14px; padding: 5px; border-radius: 3px;"
        );
      }

      return responseData;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error(
          "Akun Anda telah dinonaktifkan. Silakan hubungi administrator."
        );
      } else if (error.response?.status === 400) {
        throw new Error("Nomor telepon tidak valid");
      } else if (error.code === "ERR_NETWORK") {
        throw new Error("Tidak dapat terhubung ke server");
      }

      throw new Error(error.response?.data?.error || "Gagal mengirim OTP");
    }
  },

  verifyOTP: async (phoneNumber, otpCode) => {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      // console.log(
      //   `Verify OTP - Original: ${phoneNumber}, Normalized: ${normalizedPhone}`
      // );

      const response = await api.post("/auth/verify-otp", {
        phone: normalizedPhone,
        otp: otpCode,
      });

      if (response.data && response.data.token && response.data.user) {
        const normalizedUser = {
          ...response.data.user,
          has_password:
            response.data.user.has_password !== undefined
              ? response.data.user.has_password
              : !!response.data.user.password_hash,
        };

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(normalizedUser));

        return {
          ...response.data,
          user: normalizedUser,
        };
      } else {
        throw new Error("Response tidak valid dari server");
      }
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error(
          "Akun Anda telah dinonaktifkan. Silakan hubungi administrator."
        );
      } else if (error.response?.status === 400) {
        throw new Error("OTP tidak valid atau telah kadaluarsa");
      } else if (error.response?.status === 401) {
        throw new Error("Verifikasi OTP gagal");
      } else if (error.code === "ERR_NETWORK") {
        throw new Error("Tidak dapat terhubung ke server");
      }

      throw new Error(error.response?.data?.error || "Gagal memverifikasi OTP");
    }
  },

  getCurrentUser: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return null;
      }

      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        authService.clearAuthData();
        return null;
      }

      throw error;
    }
  },

  logout: () => {
    authService.clearAuthData();
    window.location.href = "/";
  },

  logoutPelanggan: () => {
    authService.clearAuthData();
    window.location.href = "/";
  },

  logoutAdmin: () => {
    authService.clearAuthData();
    window.location.href = "/admin-login";
  },

  clearAuthData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("refreshToken");
  },

  getToken: () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || null
    );
  },

  getStoredUser: () => {
    try {
      const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      return {
        ...user,
        has_password:
          user.has_password !== undefined ? user.has_password : false,
      };
    } catch (error) {
      authService.clearAuthData();
      return null;
    }
  },

  isAuthenticated: () => {
    return !!authService.getToken();
  },

  hasRole: (role) => {
    const user = authService.getStoredUser();
    return user && user.role === role;
  },

  isAdmin: () => {
    return authService.hasRole("admin");
  },

  isKasir: () => {
    return authService.hasRole("kasir");
  },

  isPelanggan: () => {
    const user = authService.getStoredUser();
    return user && (user.role === "pelanggan" || !user.role);
  },
};
