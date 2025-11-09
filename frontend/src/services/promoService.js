import api from "./api";

export const promoService = {
  getAllPromos: async () => {
    try {
      const response = await api.get("/promos");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPromoById: async (id) => {
    try {
      const response = await api.get(`/promos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPromoProducts: async (promoId) => {
    try {
      const response = await api.get(`/promos/${promoId}/products`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
