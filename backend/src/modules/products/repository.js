const pool = require('../../config/db')
 
const ProductRepository = {
  async findAll({ category, make, model, year, is_active = true } = {}) {
    const conditions = ['p.is_active = $1']
    const values = [is_active]
    let i = 2
 
    if (category) {
      conditions.push(`p.category = $${i++}`)
      values.push(category)
    }
 
    // Filtro por compatibilidad de vehículo
    let joinVehicle = ''
    if (make || model || year) {
      joinVehicle = `
        INNER JOIN vehicle_compatibility vc ON vc.product_id = p.id
      `
      if (make) {
        conditions.push(`LOWER(vc.make) = LOWER($${i++})`)
        values.push(make)
      }
      if (model) {
        conditions.push(`LOWER(vc.model) = LOWER($${i++})`)
        values.push(model)
      }
      if (year) {
        conditions.push(`(vc.year_from IS NULL OR vc.year_from <= $${i})`)
        conditions.push(`(vc.year_to IS NULL OR vc.year_to >= $${i++})`)
        values.push(parseInt(year))
      }
    }
 
    const query = `
      SELECT
        p.id, p.name, p.slug, p.sku, p.description,
        p.price, p.brand, p.category, p.status, p.stock_status,
        p.created_at,
        -- Imagen principal (order = 0)
        (
          SELECT url FROM product_images
          WHERE product_id = p.id
          ORDER BY display_order ASC
          LIMIT 1
        ) AS main_image
      FROM products p
      ${joinVehicle}
      WHERE ${conditions.join(' AND ')}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `
 
    const { rows } = await pool.query(query, values)
    return rows
  },
 
  async findById(id) {
    const productQuery = `
      SELECT
        p.id, p.name, p.slug, p.sku, p.description,
        p.price, p.brand, p.category, p.status, p.stock_status,
        p.is_active, p.created_at
      FROM products p
      WHERE p.id = $1
    `
    const imagesQuery = `
      SELECT id, url, alt_text, display_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY display_order ASC
    `
    const compatQuery = `
      SELECT id, make, model, year_from, year_to
      FROM vehicle_compatibility
      WHERE product_id = $1
      ORDER BY make, model
    `
 
    const [product, images, compatibility] = await Promise.all([
      pool.query(productQuery, [id]),
      pool.query(imagesQuery, [id]),
      pool.query(compatQuery, [id]),
    ])
 
    if (product.rows.length === 0) return null
 
    return {
      ...product.rows[0],
      images: images.rows,
      compatible_vehicles: compatibility.rows,
    }
  },
 
  async findBySlug(slug) {
    const { rows } = await pool.query(
      'SELECT id FROM products WHERE slug = $1',
      [slug]
    )
    if (rows.length === 0) return null
    return this.findById(rows[0].id)
  },
 
  async create({ name, slug, sku, description, price, brand, category, status, stock_status, images = [], compatible_vehicles = [] }) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
 
      const { rows } = await client.query(
        `INSERT INTO products (name, slug, sku, description, price, brand, category, status, stock_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, slug, sku, description, price, brand, category, status, stock_status || 'bajo_pedido']
      )
      const product = rows[0]
 
      // Insertar imágenes
      for (const [index, img] of images.entries()) {
        await client.query(
          `INSERT INTO product_images (product_id, url, alt_text, display_order)
           VALUES ($1, $2, $3, $4)`,
          [product.id, img.url, img.alt_text || '', img.display_order ?? index]
        )
      }
 
      // Insertar compatibilidades de vehículos
      for (const v of compatible_vehicles) {
        await client.query(
          `INSERT INTO vehicle_compatibility (product_id, make, model, year_from, year_to)
           VALUES ($1, $2, $3, $4, $5)`,
          [product.id, v.make, v.model, v.year_from || null, v.year_to || null]
        )
      }
 
      await client.query('COMMIT')
      return this.findById(product.id)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },
 
  async update(id, fields) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
 
      const allowed = ['name', 'slug', 'sku', 'description', 'price', 'brand', 'category', 'status', 'stock_status', 'is_active']
      const updates = []
      const values = []
      let i = 1
 
      for (const key of allowed) {
        if (fields[key] !== undefined) {
          updates.push(`${key} = $${i++}`)
          values.push(fields[key])
        }
      }
 
      if (updates.length > 0) {
        values.push(id)
        await client.query(
          `UPDATE products SET ${updates.join(', ')} WHERE id = $${i}`,
          values
        )
      }
 
      // Reemplazar imágenes si vienen en el body
      if (fields.images !== undefined) {
        await client.query('DELETE FROM product_images WHERE product_id = $1', [id])
        for (const [index, img] of fields.images.entries()) {
          await client.query(
            `INSERT INTO product_images (product_id, url, alt_text, display_order)
             VALUES ($1, $2, $3, $4)`,
            [id, img.url, img.alt_text || '', img.display_order ?? index]
          )
        }
      }
 
      // Reemplazar compatibilidades si vienen en el body
      if (fields.compatible_vehicles !== undefined) {
        await client.query('DELETE FROM vehicle_compatibility WHERE product_id = $1', [id])
        for (const v of fields.compatible_vehicles) {
          await client.query(
            `INSERT INTO vehicle_compatibility (product_id, make, model, year_from, year_to)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, v.make, v.model, v.year_from || null, v.year_to || null]
          )
        }
      }
 
      await client.query('COMMIT')
      return this.findById(id)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },
 
  async delete(id) {
    // Soft delete — no borramos el registro, solo lo desactivamos
    const { rows } = await pool.query(
      'UPDATE products SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    )
    return rows.length > 0
  },
 
  async slugExists(slug, excludeId = null) {
    const query = excludeId
      ? 'SELECT id FROM products WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM products WHERE slug = $1'
    const params = excludeId ? [slug, excludeId] : [slug]
    const { rows } = await pool.query(query, params)
    return rows.length > 0
  },
 
  async skuExists(sku, excludeId = null) {
    const query = excludeId
      ? 'SELECT id FROM products WHERE sku = $1 AND id != $2'
      : 'SELECT id FROM products WHERE sku = $1'
    const params = excludeId ? [sku, excludeId] : [sku]
    const { rows } = await pool.query(query, params)
    return rows.length > 0
  },
}
 
module.exports = ProductRepository