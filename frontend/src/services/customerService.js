import api from "./api";

export const customerService = {
  getOrderHistory: async (params = {}) => {
    try {
      const response = await api.get("/orders/customer/orders", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || "",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error(
          "Akses ditolak. Pastikan Anda login sebagai pelanggan."
        );
      } else if (error.response?.status === 401) {
        throw new Error("Sesi telah berakhir. Silakan login kembali.");
      } else if (error.code === "ERR_NETWORK") {
        throw new Error("Tidak dapat terhubung ke server.");
      }

      throw new Error(
        error.response?.data?.error || "Gagal memuat riwayat pesanan"
      );
    }
  },

  getOrderDetail: async (orderId) => {
    try {
      const response = await api.get(`/orders/customer/orders/${orderId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error("Akses ditolak. Pesanan bukan milik Anda.");
      } else if (error.response?.status === 404) {
        throw new Error("Pesanan tidak ditemukan.");
      }

      throw new Error(
        error.response?.data?.error || "Gagal memuat detail pesanan"
      );
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData);

      return {
        ...response.data,
        user: {
          ...response.data.user,
          has_password:
            response.data.user.has_password !== undefined
              ? response.data.user.has_password
              : true,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      // console.log("Calling changePassword API with:", passwordData);
      const response = await api.put("/users/change-password", passwordData);
      // console.log("ChangePassword API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "ChangePassword API error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
