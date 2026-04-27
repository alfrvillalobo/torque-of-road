const pool = require('../../config/db')

const UploadRepository = {
  // Verificar que el producto existe y retornar su nombre para el alt_text
  async findProductById(productId) {
    const { rows } = await pool.query(
      'SELECT id, name FROM products WHERE id = $1',
      [productId]
    )
    return rows[0] || null
  },

  // Obtener el próximo display_order para poner la imagen al final de la galería
  async getNextDisplayOrder(productId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM product_images WHERE product_id = $1',
      [productId]
    )
    return parseInt(rows[0].count)
  },

  // Guardar la imagen en la DB después de subirla a Cloudinary
  async createImage({ productId, url, altText, displayOrder }) {
    const { rows } = await pool.query(
      `INSERT INTO product_images (product_id, url, alt_text, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [productId, url, altText, displayOrder]
    )
    return rows[0]
  },

  // Eliminar imagen y retornar sus datos (necesitamos la URL para borrar de Cloudinary)
  async deleteImage(imageId) {
    const { rows } = await pool.query(
      'DELETE FROM product_images WHERE id = $1 RETURNING *',
      [imageId]
    )
    return rows[0] || null
  },
}

module.exports = UploadRepository