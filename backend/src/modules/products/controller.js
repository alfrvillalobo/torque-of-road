const ProductService = require('./service')

const ProductController = {
  async getAll(req, res, next) {
    try {
      // Filtros desde query params: ?category=kits-suspension&make=Toyota&model=Hilux&year=2022
      const { category, make, model, year, is_active } = req.query
      const products = await ProductService.getAll({ category, make, model, year, is_active })
      res.json({ success: true, data: products, total: products.length })
    } catch (err) {
      next(err)
    }
  },

  async getById(req, res, next) {
    try {
      const product = await ProductService.getById(parseInt(req.params.id))
      res.json({ success: true, data: product })
    } catch (err) {
      next(err)
    }
  },

  async getBySlug(req, res, next) {
    try {
      const product = await ProductService.getBySlug(req.params.slug)
      res.json({ success: true, data: product })
    } catch (err) {
      next(err)
    }
  },

  async getCompatible(req, res, next) {
    try {
      const { make, model, year } = req.query
      const products = await ProductService.getCompatibleWithVehicle({ make, model, year })
      res.json({ success: true, data: products, total: products.length })
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const product = await ProductService.create(req.body)
      res.status(201).json({ success: true, data: product })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const product = await ProductService.update(parseInt(req.params.id), req.body)
      res.json({ success: true, data: product })
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      const result = await ProductService.delete(parseInt(req.params.id))
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  },
}

module.exports = ProductController