const { Router } = require('express')
const AuthService = require('./auth.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

// POST /api/auth/register
// Fix #4: solo un admin autenticado puede crear nuevos usuarios
// Así evitamos que cualquiera cree cuentas o se auto-asigne rol admin
router.post('/register', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { user, token } = await AuthService.register(req.body)
    res.status(201).json({ success: true, data: { user, token } })
  } catch (e) { next(e) }
})

// POST /api/auth/login — sigue siendo público (necesario para entrar al panel)
router.post('/login', async (req, res, next) => {
  try {
    const { user, token } = await AuthService.login(req.body)
    res.json({ success: true, data: { user, token } })
  } catch (e) { next(e) }
})

// GET /api/auth/me — requiere token válido
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await AuthService.me(req.user.id)
    res.json({ success: true, data: user })
  } catch (e) { next(e) }
})

module.exports = router