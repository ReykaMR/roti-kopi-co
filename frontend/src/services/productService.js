import api from "./api";

export const productService = {
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get("/products", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          category: params.category || "",
          status: params.status || "",
        },
      });

      if (response.data && response.data.data) {
        return response.data;
      } else if (response.data) {
        return response.data;
      } else {
        return response;
      }
    } catch (error) {
      console.error("Product Service Error:", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await api.post("/products", productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPromoProducts: async () => {
    try {
      const response = await api.get("/products/promo");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
