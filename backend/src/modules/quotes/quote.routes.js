const { Router } = require('express')
const rateLimit                     = require('express-rate-limit')
const QuoteService                  = require('./quote.service')
const pool                          = require('../../config/db')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')
const validateId                    = require('../../middlewares/validateId')

const router = Router()

const quoteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiadas solicitudes. Intenta de nuevo en una hora.' },
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)

    const filters = req.user.role === 'admin'
      ? { status: req.query.status, month: req.query.month, page, limit }
      : { user_id: req.user.id, page, limit }

    const result = await QuoteService.getAll(filters)
    res.json({ success: true, ...result })
  } catch (e) { next(e) }
})

router.get('/:id', requireAuth, validateId, async (req, res, next) => {
  try {
    const quote = await QuoteService.getById(req.params.id)
    if (req.user.role !== 'admin' && quote.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Sin acceso' })
    }
    res.json({ success: true, data: quote })
  } catch (e) { next(e) }
})

router.post('/', quoteLimiter, async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user?.id || null }
    res.status(201).json({ success: true, data: await QuoteService.create(data) })
  } catch (e) { next(e) }
})

router.patch('/:id/status', requireAuth, requireAdmin, validateId, async (req, res, next) => {
  try {
    const quote = await QuoteService.updateStatus(req.params.id, req.body.status)
    res.json({ success: true, data: quote })
  } catch (e) { next(e) }
})

router.post('/:id/approve-and-convert', requireAuth, requireAdmin, validateId, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const quoteId = req.params.id

    const { rows: quoteRows } = await client.query(
      `SELECT q.*,
        json_agg(json_build_object(
          'product_id', qi.product_id, 'product_name', qi.product_name,
          'unit_price', qi.unit_price, 'quantity', qi.quantity, 'subtotal', qi.subtotal
        )) FILTER (WHERE qi.id IS NOT NULL) AS items
       FROM quotes q
       LEFT JOIN quote_items qi ON qi.quote_id = q.id
       WHERE q.id = $1 GROUP BY q.id`,
      [quoteId]
    )

    if (quoteRows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, error: 'Cotización no encontrada' })
    }

    const quote = quoteRows[0]
    if (quote.status !== 'pending') {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, error: `La cotización ya está en estado "${quote.status}"` })
    }

    await client.query('UPDATE quotes SET status = $1 WHERE id = $2', ['approved', quoteId])

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, quote_id, customer_name, customer_email, customer_phone, subtotal, total, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`,
      [quote.user_id, quoteId, quote.customer_name, quote.customer_email,
       quote.customer_phone || null, quote.total, quote.total]
    )
    const order = orderRows[0]

    for (const item of (quote.items || [])) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item.product_id, item.product_name, item.unit_price, item.quantity, item.subtotal]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ success: true, data: { quote_id: quoteId, order_id: order.id } })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

router.delete('/:id', requireAuth, requireAdmin, validateId, async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM quotes WHERE id = $1 RETURNING id', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Cotización no encontrada' })
    res.json({ success: true, message: 'Cotización eliminada' })
  } catch (e) { next(e) }
})

module.exports = router