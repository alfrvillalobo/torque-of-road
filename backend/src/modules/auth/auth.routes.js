const { Router } = require('express')
const AuthService = require('./auth.service')
const { requireAuth } = require('../../middlewares/auth')

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { user, token } = await AuthService.register(req.body)
    res.status(201).json({ success: true, data: { user, token } })
  } catch (e) { next(e) }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { user, token } = await AuthService.login(req.body)
    res.json({ success: true, data: { user, token } })
  } catch (e) { next(e) }
})

// GET /api/auth/me  (requiere token)
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await AuthService.me(req.user.id)
    res.json({ success: true, data: user })
  } catch (e) { next(e) }
})

module.exports = router