const Product = require("../models/productModel");

const productController = {
  getAllProducts: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, category, search, status } = req.query;

      const result = await Product.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        search,
        status,
      });

      res.json({
        success: true,
        data: {
          products: result.products,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Produk tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, res, next) => {
    try {
      const {
        nama,
        deskripsi,
        harga,
        kategori,
        status,
        gambar_url,
        original_price,
        discount_percent,
        is_promo,
        valid_until,
      } = req.body;

      if (!nama || !harga || !kategori) {
        return res.status(400).json({
          success: false,
          error: "Nama, harga, dan kategori wajib diisi",
        });
      }

      if (parseFloat(harga) < 0) {
        return res.status(400).json({
          success: false,
          error: "Harga tidak boleh negatif",
        });
      }

      if (discount_percent && discount_percent > 0) {
        if (!original_price) {
          return res.status(400).json({
            success: false,
            error: "Harga asli harus diisi ketika ada diskon",
          });
        }

        if (parseFloat(original_price) <= parseFloat(harga)) {
          return res.status(400).json({
            success: false,
            error: "Harga diskon harus lebih rendah dari harga asli",
          });
        }

        const calculatedDiscount = Math.round(
          ((original_price - harga) / original_price) * 100
        );
        if (Math.abs(calculatedDiscount - discount_percent) > 1) {
          return res.status(400).json({
            success: false,
            error: "Persentase diskon tidak sesuai dengan harga",
          });
        }
      }

      const productId = await Product.create({
        nama,
        deskripsi: deskripsi || "",
        harga: parseFloat(harga),
        kategori,
        status: status || "available",
        gambar_url: gambar_url || "",
        original_price: original_price ? parseFloat(original_price) : null,
        discount_percent: discount_percent ? parseInt(discount_percent) : null,
        is_promo: is_promo || false,
        valid_until: valid_until || null,
      });

      res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan",
        data: {
          product_id: productId,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        nama,
        deskripsi,
        harga,
        kategori,
        status,
        gambar_url,
        original_price,
        discount_percent,
        is_promo,
        valid_until,
      } = req.body;

      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: "Produk tidak ditemukan",
        });
      }

      if (!nama || !harga || !kategori) {
        return res.status(400).json({
          success: false,
          error: "Nama, harga, dan kategori wajib diisi",
        });
      }

      if (parseFloat(harga) < 0) {
        return res.status(400).json({
          success: false,
          error: "Harga tidak boleh negatif",
        });
      }

      if (discount_percent && discount_percent > 0) {
        if (!original_price) {
          return res.status(400).json({
            success: false,
            error: "Harga asli harus diisi ketika ada diskon",
          });
        }

        if (parseFloat(original_price) <= parseFloat(harga)) {
          return res.status(400).json({
            success: false,
            error: "Harga diskon harus lebih rendah dari harga asli",
          });
        }

        const calculatedDiscount = Math.round(
          ((original_price - harga) / original_price) * 100
        );
        if (Math.abs(calculatedDiscount - discount_percent) > 1) {
          return res.status(400).json({
            success: false,
            error: "Persentase diskon tidak sesuai dengan harga",
          });
        }
      }

      const updated = await Product.update(id, {
        nama,
        deskripsi: deskripsi || "",
        harga: parseFloat(harga),
        kategori,
        status,
        gambar_url: gambar_url || "",
        original_price: original_price ? parseFloat(original_price) : null,
        discount_percent: discount_percent ? parseInt(discount_percent) : null,
        is_promo: is_promo || false,
        valid_until: valid_until || null,
      });

      if (!updated) {
        return res.status(500).json({
          success: false,
          error: "Gagal memperbarui produk",
        });
      }

      res.json({
        success: true,
        message: "Produk berhasil diperbarui",
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;

      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: "Produk tidak ditemukan",
        });
      }

      const deleted = await Product.delete(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: "Gagal menghapus produk",
        });
      }

      res.json({
        success: true,
        message: "Produk berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  },

  getPromoProducts: async (req, res, next) => {
    try {
      const promoProducts = await Product.findPromoProducts();

      res.json({
        success: true,
        data: promoProducts,
      });
    } catch (error) {
      next(error);
    }
  },

  updateExpiredPromos: async (req, res, next) => {
    try {
      const updatedCount = await Product.updateExpiredPromos();

      res.json({
        success: true,
        message: `Berhasil mengupdate ${updatedCount} produk promo yang expired`,
        data: {
          updated_count: updatedCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productController;
