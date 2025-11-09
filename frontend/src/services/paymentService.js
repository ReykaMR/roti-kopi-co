import api from "./api";

export const paymentService = {
  generateQRIS: async (orderId, amount) => {
    try {
      if (!orderId || !amount || amount <= 0) {
        throw new Error("Order ID dan amount harus valid");
      }

      const response = await api.post("/payments/qris", {
        order_id: orderId,
        amount: parseFloat(amount),
      });

      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.error || "Response dari server tidak valid"
        );
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        throw new Error(
          errorData?.error || errorData?.message || "Gagal menghasilkan QR code"
        );
      } else if (error.request) {
        throw new Error(
          "Tidak ada respons dari server. Periksa koneksi jaringan Anda."
        );
      } else {
        throw new Error(
          error.message || "Terjadi kesalahan saat menghasilkan QR code"
        );
      }
    }
  },

  checkPaymentStatus: async (paymentId) => {
    try {
      if (!paymentId) {
        throw new Error("Payment ID harus diisi");
      }

      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data?.error ||
            error.response.data?.message ||
            "Gagal memeriksa status pembayaran"
        );
      }
      throw error;
    }
  },

  getPaymentStatusByOrderId: async (orderId) => {
    try {
      const response = await api.get(`/payments/status/${orderId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          status: "unpaid",
          order_id: orderId,
          message: "Payment record not found",
        };
      }
      throw error;
    }
  },

  simulatePayment: async (paymentId) => {
    try {
      const response = await api.post("/payments/simulate", {
        payment_id: paymentId,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data?.error ||
            error.response.data?.message ||
            "Gagal mensimulasikan pembayaran"
        );
      } else {
        throw new Error("Gagal mensimulasikan pembayaran");
      }
    }
  },

  updatePaymentStatus: async (paymentId, status) => {
    try {
      const response = await api.put(`/payments/${paymentId}/status`, {
        status: status,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data?.error ||
            error.response.data?.message ||
            "Gagal mengupdate status pembayaran"
        );
      } else {
        throw new Error("Gagal mengupdate status pembayaran");
      }
    }
  },

  getAllPayments: async (params = {}) => {
    try {
      const response = await api.get("/payments", {
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
};
