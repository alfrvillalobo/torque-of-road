const { Router } = require('express')
const InstallationService = require('./installation.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

// Todas las rutas de instalación son solo para admin
router.use(requireAuth, requireAdmin)

router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, data: await InstallationService.getAll({ status: req.query.status }) })
  } catch (e) { next(e) }
})

router.get('/calculate', (req, res, next) => {
  try {
    const result = InstallationService.calculatePrice({
      mechanic_cost:  +req.query.mechanic_cost,
      torque_margin:  +req.query.torque_margin,
    })
    res.json({ success: true, data: result })
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await InstallationService.getById(+req.params.id) })
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await InstallationService.create(req.body) })
  } catch (e) { next(e) }
})

router.put('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await InstallationService.update(+req.params.id, req.body) })
  } catch (e) { next(e) }
})

module.exports = router