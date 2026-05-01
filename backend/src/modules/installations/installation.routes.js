const { Router } = require('express')
const InstallationService           = require('./installation.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')
const validateId                    = require('../../middlewares/validateId')

const router = Router()

router.use(requireAuth, requireAdmin)

router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, data: await InstallationService.getAll({ status: req.query.status }) })
  } catch (e) { next(e) }
})

router.get('/calculate', (req, res, next) => {
  try {
    const mechanic_cost = Number(req.query.mechanic_cost)
    const torque_margin = Number(req.query.torque_margin)
    if (isNaN(mechanic_cost) || isNaN(torque_margin)) {
      return res.status(400).json({ success: false, error: 'mechanic_cost y torque_margin deben ser números' })
    }
    res.json({ success: true, data: InstallationService.calculatePrice({ mechanic_cost, torque_margin }) })
  } catch (e) { next(e) }
})

router.get('/:id',  validateId, async (req, res, next) => { try { res.json({ success: true, data: await InstallationService.getById(req.params.id) }) } catch (e) { next(e) } })
router.post('/',    async (req, res, next) => { try { res.status(201).json({ success: true, data: await InstallationService.create(req.body) }) } catch (e) { next(e) } })
router.put('/:id',  validateId, async (req, res, next) => { try { res.json({ success: true, data: await InstallationService.update(req.params.id, req.body) }) } catch (e) { next(e) } })

module.exports = router