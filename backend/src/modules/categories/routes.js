const { Router } = require('express')
const CategoryService               = require('./service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')
const validateId                    = require('../../middlewares/validateId')

const router = Router()

router.get('/',           async (req, res, next) => { try { res.json({ success: true, data: await CategoryService.getAll() }) } catch (e) { next(e) } })
router.get('/slug/:slug', async (req, res, next) => { try { res.json({ success: true, data: await CategoryService.getBySlug(req.params.slug) }) } catch (e) { next(e) } })
router.get('/:id',        validateId, async (req, res, next) => { try { res.json({ success: true, data: await CategoryService.getById(req.params.id) }) } catch (e) { next(e) } })

router.post('/',    requireAuth, requireAdmin, async (req, res, next) => { try { res.status(201).json({ success: true, data: await CategoryService.create(req.body) }) } catch (e) { next(e) } })
router.put('/:id',  requireAuth, requireAdmin, validateId, async (req, res, next) => { try { res.json({ success: true, data: await CategoryService.update(req.params.id, req.body) }) } catch (e) { next(e) } })
router.delete('/:id', requireAuth, requireAdmin, validateId, async (req, res, next) => { try { res.json({ success: true, ...(await CategoryService.delete(req.params.id)) }) } catch (e) { next(e) } })

module.exports = router