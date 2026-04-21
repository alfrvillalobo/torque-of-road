const { Router } = require('express')
const AvailabilityService = require('./availability.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

// Ver disponibilidad de un producto es solo para admin (tiene precios de costo)
// GET /api/availability/product/:productId
router.get('/product/:productId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    res.json({ success: true, data: await AvailabilityService.getByProduct(+req.params.productId) })
  } catch (e) { next(e) }
})

// GET /api/availability/product/:productId/cheapest
// Útil internamente al confirmar un pedido: ¿de quién compramos?
router.get('/product/:productId/cheapest', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    res.json({ success: true, data: await AvailabilityService.getCheapest(+req.params.productId) })
  } catch (e) { next(e) }
})

// POST /api/availability — crear o actualizar disponibilidad (upsert)
// Body: { product_id, supplier_id, cost_price, lead_days, is_available, notes }
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    res.json({ success: true, data: await AvailabilityService.upsert(req.body) })
  } catch (e) { next(e) }
})

// DELETE /api/availability/product/:productId/supplier/:supplierId
router.delete('/product/:productId/supplier/:supplierId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await AvailabilityService.remove(+req.params.productId, +req.params.supplierId)
    res.json({ success: true, ...result })
  } catch (e) { next(e) }
})

module.exports = router
