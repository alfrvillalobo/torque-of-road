const { Router } = require('express')
const ShipmentService = require('./shipment.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

router.use(requireAuth, requireAdmin)

// GET /api/shipments?status=in_transit&order_id=5
router.get('/', async (req, res, next) => {
  try {
    const { status, order_id } = req.query
    res.json({ success: true, data: await ShipmentService.getAll({ status, order_id: order_id ? +order_id : undefined }) })
  } catch (e) { next(e) }
})

// GET /api/shipments/:id
router.get('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await ShipmentService.getById(+req.params.id) })
  } catch (e) { next(e) }
})

// POST /api/shipments
// Body: { order_id, supplier_id?, tracking_number?, carrier?, shipping_cost?, estimated_date?, destination }
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await ShipmentService.create(req.body) })
  } catch (e) { next(e) }
})

// PUT /api/shipments/:id — actualizar tracking, estado, fecha entrega, etc.
router.put('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await ShipmentService.update(+req.params.id, req.body) })
  } catch (e) { next(e) }
})

module.exports = router
