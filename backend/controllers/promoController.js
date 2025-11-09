const Promo = require("../models/promoModel");

const promoController = {
  getAllPromos: async (req, res, next) => {
    try {
      const promos = await Promo.findAll();
      res.json(promos);
    } catch (error) {
      next(error);
    }
  },

  getPromoById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const promo = await Promo.findById(id);

      if (!promo) {
        return res.status(404).json({ error: "Promo tidak ditemukan" });
      }

      res.json(promo);
    } catch (error) {
      next(error);
    }
  },

  getPromoProducts: async (req, res, next) => {
    try {
      const { id } = req.params;
      const products = await Promo.getProducts(id);
      res.json(products);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = promoController;
