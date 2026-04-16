const { Router } = require('express')
const QuoteService = require('./quote.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

// GET /api/quotes — solo admin ve todas; usuario ve las suyas
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filters = req.user.role === 'admin'
      ? { status: req.query.status }
      : { user_id: req.user.id }
    res.json({ success: true, data: await QuoteService.getAll(filters) })
  } catch (e) { next(e) }
})

// GET /api/quotes/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const quote = await QuoteService.getById(+req.params.id)
    // usuario solo puede ver sus propias cotizaciones
    if (req.user.role !== 'admin' && quote.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Sin acceso' })
    }
    res.json({ success: true, data: quote })
  } catch (e) { next(e) }
})

// POST /api/quotes — cualquiera puede crear (también sin login: guest quotes)
router.post('/', async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user?.id || null }
    res.status(201).json({ success: true, data: await QuoteService.create(data) })
  } catch (e) { next(e) }
})

// PATCH /api/quotes/:id/status — solo admin
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const quote = await QuoteService.updateStatus(+req.params.id, req.body.status)
    res.json({ success: true, data: quote })
  } catch (e) { next(e) }
})

module.exports = router