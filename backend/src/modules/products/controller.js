const ProductService = require('./service')

const ProductController = {
  async getAll(req, res, next) {
    try {
      const { category, make, model, year, is_active } = req.query
      const page  = Math.max(1, parseInt(req.query.page)  || 1)
      const limit = Math.min(100, parseInt(req.query.limit) || 20)

      const result = await ProductService.getAll({ category, make, model, year, is_active, page, limit })
      res.json({ success: true, ...result })
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
      const page  = Math.max(1, parseInt(req.query.page)  || 1)
      const limit = Math.min(100, parseInt(req.query.limit) || 20)

      const result = await ProductService.getCompatibleWithVehicle({ make, model, year, page, limit })
      res.json({ success: true, ...result })
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