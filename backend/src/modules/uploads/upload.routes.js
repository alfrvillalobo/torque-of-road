const { Router } = require('express')
const cloudinary  = require('../../config/cloudinary')
const upload      = require('../../middlewares/upload')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')
const pool        = require('../../config/db')

const router = Router()

// Función que sube el buffer al stream de Cloudinary
// Usamos stream porque multer nos da el archivo en memoria, no en disco
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // max 1200px
          { quality: 'auto', fetch_format: 'auto' },    // optimización automática
        ],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

// POST /api/uploads/product/:productId
// Sube una imagen y la guarda en product_images
router.post(
  '/product/:productId',
  requireAuth,
  requireAdmin,
  upload.single('image'), // 'image' es el nombre del campo en el form
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' })
      }

      const productId = parseInt(req.params.productId)

      // Verificar que el producto existe
      const { rows } = await pool.query('SELECT id, name FROM products WHERE id = $1', [productId])
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Producto no encontrado' })
      }

      // Subir a Cloudinary en la carpeta torque-off-road/products
      const result = await uploadToCloudinary(req.file.buffer, 'torque-off-road/products')

      // Obtener el orden actual para poner la nueva imagen al final
      const { rows: existing } = await pool.query(
        'SELECT COUNT(*) as count FROM product_images WHERE product_id = $1',
        [productId]
      )
      const displayOrder = parseInt(existing[0].count)

      // Guardar en la DB
      const { rows: imageRows } = await pool.query(
        `INSERT INTO product_images (product_id, url, alt_text, display_order)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [productId, result.secure_url, rows[0].name, displayOrder]
      )

      res.status(201).json({ success: true, data: imageRows[0] })
    } catch (err) {
      next(err)
    }
  }
)

// DELETE /api/uploads/image/:imageId
// Elimina una imagen de product_images (y de Cloudinary si tiene public_id)
router.delete('/image/:imageId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM product_images WHERE id = $1 RETURNING *',
      [parseInt(req.params.imageId)]
    )
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Imagen no encontrada' })
    }

    // Intentar borrar de Cloudinary extrayendo el public_id de la URL
    try {
      const url    = rows[0].url
      const parts  = url.split('/')
      const file   = parts[parts.length - 1].split('.')[0]
      const folder = parts[parts.length - 2]
      await cloudinary.uploader.destroy(`${folder}/${file}`)
    } catch {
      // Si falla el borrado en Cloudinary no bloqueamos la respuesta
    }

    res.json({ success: true, message: 'Imagen eliminada' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
