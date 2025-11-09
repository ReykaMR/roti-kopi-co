import api from "./api";

export const specialEventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get("/special-events");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/special-events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
