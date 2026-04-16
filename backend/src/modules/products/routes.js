const { Router } = require('express')
const ProductController = require('./controller')
 
const router = Router()
 
// GET /api/products                         → todos los productos (con filtros opcionales)
// GET /api/products?category=kits-suspension
// GET /api/products?make=Toyota&model=Hilux&year=2022
router.get('/', ProductController.getAll)
 
// GET /api/products/compatible?make=Toyota&model=Hilux&year=2022
router.get('/compatible', ProductController.getCompatible)
 
// GET /api/products/slug/:slug              → para el frontend (URLs amigables)
router.get('/slug/:slug', ProductController.getBySlug)
 
// GET /api/products/:id
router.get('/:id', ProductController.getById)
 
// POST /api/products
router.post('/', ProductController.create)
 
// PUT /api/products/:id
router.put('/:id', ProductController.update)
 
// DELETE /api/products/:id  (soft delete)
router.delete('/:id', ProductController.delete)
 
module.exports = router