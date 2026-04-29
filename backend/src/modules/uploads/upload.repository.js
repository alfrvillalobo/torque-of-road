const pool = require('../../config/db')

const UploadRepository = {
  async findProductById(productId) {
    const { rows } = await pool.query(
      'SELECT id, name FROM products WHERE id = $1',
      [productId]
    )
    return rows[0] || null
  },
  async getNextDisplayOrder(productId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM product_images WHERE product_id = $1',
      [productId]
    )
    return parseInt(rows[0].count)
  },
  async createImage({ productId, url, altText, displayOrder }) {
    const { rows } = await pool.query(
      `INSERT INTO product_images (product_id, url, alt_text, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [productId, url, altText, displayOrder]
    )
    return rows[0]
  },
  async deleteImage(imageId) {
    const { rows } = await pool.query(
      'DELETE FROM product_images WHERE id = $1 RETURNING *',
      [imageId]
    )
    return rows[0] || null
  },
}

module.exports = UploadRepository