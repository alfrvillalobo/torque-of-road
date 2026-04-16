const { Router } = require('express')
const CategoryService = require('./service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

const ctrl = {
  async getAll(req, res, next) {
    try {
      res.json({ success: true, data: await CategoryService.getAll() })
    } catch (e) { next(e) }
  },
  async getBySlug(req, res, next) {
    try {
      res.json({ success: true, data: await CategoryService.getBySlug(req.params.slug) })
    } catch (e) { next(e) }
  },
  async getById(req, res, next) {
    try {
      res.json({ success: true, data: await CategoryService.getById(+req.params.id) })
    } catch (e) { next(e) }
  },
  async create(req, res, next) {
    try {
      res.status(201).json({ success: true, data: await CategoryService.create(req.body) })
    } catch (e) { next(e) }
  },
  async update(req, res, next) {
    try {
      res.json({ success: true, data: await CategoryService.update(+req.params.id, req.body) })
    } catch (e) { next(e) }
  },
  async delete(req, res, next) {
    try {
      res.json({ success: true, ...(await CategoryService.delete(+req.params.id)) })
    } catch (e) { next(e) }
  },
}

router.get('/',               ctrl.getAll)
router.get('/slug/:slug',     ctrl.getBySlug)
router.get('/:id',            ctrl.getById)
router.post('/',   requireAuth, requireAdmin, ctrl.create)
router.put('/:id', requireAuth, requireAdmin, ctrl.update)
router.delete('/:id', requireAuth, requireAdmin, ctrl.delete)

module.exports = router