const { Router } = require('express')
const OrderService = require('./order.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filters = req.user.role === 'admin'
      ? { status: req.query.status }
      : { user_id: req.user.id }
    res.json({ success: true, data: await OrderService.getAll(filters) })
  } catch (e) { next(e) }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await OrderService.getById(+req.params.id)
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Sin acceso' })
    }
    res.json({ success: true, data: order })
  } catch (e) { next(e) }
})

// Crear pedido desde cotización aprobada
router.post('/from-quote/:quoteId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const order = await OrderService.createFromQuote(+req.params.quoteId, req.body)
    res.status(201).json({ success: true, data: order })
  } catch (e) { next(e) }
})

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const order = await OrderService.updateStatus(+req.params.id, req.body.status)
    res.json({ success: true, data: order })
  } catch (e) { next(e) }
})

module.exports = router