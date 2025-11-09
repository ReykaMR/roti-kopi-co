import api from "./api";

export const orderService = {
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get("/orders", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || "",
          start_date: params.start_date || "",
          end_date: params.end_date || "",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCustomerOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/customer/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error("Anda tidak memiliki akses untuk melihat pesanan ini");
      } else if (error.response?.status === 404) {
        throw new Error("Pesanan tidak ditemukan");
      } else {
        throw error;
      }
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);

      if (!response.data || !response.data.order_id) {
        throw new Error("Response dari server tidak valid");
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMsg =
          error.response.data?.error ||
          error.response.data?.message ||
          "Gagal membuat order";
        throw new Error(errorMsg);
      } else if (error.request) {
        throw new Error(
          "Tidak ada respons dari server. Periksa koneksi jaringan Anda."
        );
      } else {
        throw new Error("Terjadi kesalahan saat membuat order");
      }
    }
  },

  updateOrderStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/orders/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSalesReport: async (params = {}) => {
    try {
      const response = await api.get("/orders/reports/sales", {
        params: {
          start_date: params.start_date || "",
          end_date: params.end_date || "",
          group_by: params.group_by || "day",
        },
      });

      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  },
};
