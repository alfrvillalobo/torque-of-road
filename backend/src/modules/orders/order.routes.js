const { Router } = require('express')
const OrderService                  = require('./order.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')
const validateId                    = require('../../middlewares/validateId')

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filters = req.user.role === 'admin'
      ? { status: req.query.status, month: req.query.month }
      : { user_id: req.user.id }
    res.json({ success: true, data: await OrderService.getAll(filters) })
  } catch (e) { next(e) }
})

router.get('/:id', requireAuth, validateId, async (req, res, next) => {
  try {
    const order = await OrderService.getById(req.params.id)
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Sin acceso' })
    }
    res.json({ success: true, data: order })
  } catch (e) { next(e) }
})

router.post('/from-quote/:quoteId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const quoteId = Number(req.params.quoteId)
    if (!Number.isInteger(quoteId) || quoteId <= 0) {
      return res.status(400).json({ success: false, error: 'ID de cotización inválido' })
    }
    const order = await OrderService.createFromQuote(quoteId, req.body)
    res.status(201).json({ success: true, data: order })
  } catch (e) { next(e) }
})

router.patch('/:id/status', requireAuth, requireAdmin, validateId, async (req, res, next) => {
  try {
    const order = await OrderService.updateStatus(req.params.id, req.body.status)
    res.json({ success: true, data: order })
  } catch (e) { next(e) }
})

module.exports = router