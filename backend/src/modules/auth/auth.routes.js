const { Router } = require('express')
const rateLimit  = require('express-rate-limit')
const AuthService = require('./auth.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')
const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ventana de 15 minutos
  max: 10,                   // máximo 10 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
})

router.post('/register', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { user, token } = await AuthService.register(req.body)
    res.status(201).json({ success: true, data: { user, token } })
  } catch (e) { next(e) }
})

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { user, token } = await AuthService.login(req.body)
    res.json({ success: true, data: { user, token } })
  } catch (e) { next(e) }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await AuthService.me(req.user.id)
    res.json({ success: true, data: user })
  } catch (e) { next(e) }
})

module.exports = router