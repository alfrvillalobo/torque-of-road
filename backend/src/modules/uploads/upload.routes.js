const { Router }                    = require('express')
const upload                        = require('../../middlewares/upload')
const UploadService                 = require('./upload.service')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = Router()

router.post(
  '/product/:productId',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' })
      }
      const image = await UploadService.uploadProductImage(
        parseInt(req.params.productId),
        req.file.buffer
      )
      res.status(201).json({ success: true, data: image })
    } catch (err) {
      next(err)
    }
  }
)

router.delete('/image/:imageId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await UploadService.deleteImage(parseInt(req.params.imageId))
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
})

module.exports = router