const SpecialEvent = require("../models/specialEventModel");

const specialEventController = {
  getAllEvents: async (req, res, next) => {
    try {
      const events = await SpecialEvent.findAll();
      res.json(events);
    } catch (error) {
      next(error);
    }
  },

  getEventById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const event = await SpecialEvent.findById(id);

      if (!event) {
        return res.status(404).json({ error: "Event tidak ditemukan" });
      }

      res.json(event);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = specialEventController;
