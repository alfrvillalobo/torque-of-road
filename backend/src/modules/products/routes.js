const { Router } = require('express')
const ProductController              = require('./controller')
const { requireAuth, requireAdmin }  = require('../../middlewares/auth')
const validateId                     = require('../../middlewares/validateId')

const router = Router()

router.get('/',           ProductController.getAll)
router.get('/compatible', ProductController.getCompatible)
router.get('/slug/:slug', ProductController.getBySlug)

router.get('/:id', validateId, ProductController.getById)

router.post('/',    requireAuth, requireAdmin, ProductController.create)
router.put('/:id',  requireAuth, requireAdmin, validateId, ProductController.update)
router.delete('/:id', requireAuth, requireAdmin, validateId, ProductController.delete)

module.exports = router