const { Router } = require('express')
const SupplierService               = require('./supplier.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')
const validateId                    = require('../../middlewares/validateId')

const router = Router()

router.use(requireAuth, requireAdmin)

router.get('/', async (req, res, next) => {
  try {
    const is_active = req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
    res.json({ success: true, data: await SupplierService.getAll({ is_active }) })
  } catch (e) { next(e) }
})

router.get('/:id',    validateId, async (req, res, next) => { try { res.json({ success: true, data: await SupplierService.getWithProducts(req.params.id) }) } catch (e) { next(e) } })
router.post('/',      async (req, res, next) => { try { res.status(201).json({ success: true, data: await SupplierService.create(req.body) }) } catch (e) { next(e) } })
router.put('/:id',    validateId, async (req, res, next) => { try { res.json({ success: true, data: await SupplierService.update(req.params.id, req.body) }) } catch (e) { next(e) } })
router.delete('/:id', validateId, async (req, res, next) => { try { res.json({ success: true, ...(await SupplierService.delete(req.params.id)) }) } catch (e) { next(e) } })

module.exports = router