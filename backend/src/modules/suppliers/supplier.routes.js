const { Router } = require('express')
const SupplierService = require('./supplier.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

// Solo admin puede ver y gestionar distribuidores (info sensible: precios de costo)
router.use(requireAuth, requireAdmin)

// GET /api/suppliers?is_active=true
router.get('/', async (req, res, next) => {
  try {
    const is_active = req.query.is_active !== undefined
      ? req.query.is_active === 'true'
      : undefined
    res.json({ success: true, data: await SupplierService.getAll({ is_active }) })
  } catch (e) { next(e) }
})

// GET /api/suppliers/:id  — con sus productos y márgenes
router.get('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await SupplierService.getWithProducts(+req.params.id) })
  } catch (e) { next(e) }
})

// POST /api/suppliers
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await SupplierService.create(req.body) })
  } catch (e) { next(e) }
})

// PUT /api/suppliers/:id
router.put('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await SupplierService.update(+req.params.id, req.body) })
  } catch (e) { next(e) }
})

// DELETE /api/suppliers/:id  (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, ...(await SupplierService.delete(+req.params.id)) })
  } catch (e) { next(e) }
})

module.exports = router
