const pool = require('../../config/db')

const ProductRepository = {

  // Genera el siguiente SKU disponible: TOR-001, TOR-002, etc.
  async generateSku() {
    const { rows } = await pool.query(`SELECT LPAD(nextval('sku_seq')::text, 3, '0') AS num`)
    return `TOR-${rows[0].num}`
  },

  async findAll({ category, make, model, year, is_active = true, page = 1, limit = 20 } = {}) {
    const conditions = ['p.is_active = $1']
    const values     = [is_active]
    let i = 2

    // Filtro por categoría usando la tabla intermedia
    let joinCategory = ''
    if (category) {
      joinCategory = `INNER JOIN product_categories pc ON pc.product_id = p.id
                      INNER JOIN categories cat ON cat.id = pc.category_id`
      conditions.push(`cat.slug = $${i++}`)
      values.push(category)
    }

    let joinVehicle = ''
    if (make || model || year) {
      joinVehicle = `INNER JOIN vehicle_compatibility vc ON vc.product_id = p.id`
      if (make)  { conditions.push(`LOWER(vc.make)  = LOWER($${i++})`); values.push(make) }
      if (model) { conditions.push(`LOWER(vc.model) = LOWER($${i++})`); values.push(model) }
      if (year) {
        conditions.push(`(vc.year_from IS NULL OR vc.year_from <= $${i})`)
        conditions.push(`(vc.year_to   IS NULL OR vc.year_to   >= $${i++})`)
        values.push(parseInt(year))
      }
    }

    const where  = `WHERE ${conditions.join(' AND ')}`
    const offset = (page - 1) * limit

    const [countResult, dataResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(DISTINCT p.id) FROM products p ${joinCategory} ${joinVehicle} ${where}`,
        values
      ),
      pool.query(`
        SELECT
          p.id, p.name, p.slug, p.sku, p.description,
          p.price, p.brand, p.status, p.stock_status, p.created_at,
          -- Categorías como array de objetos
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('id', cat2.id, 'name', cat2.name, 'slug', cat2.slug))
            FILTER (WHERE cat2.id IS NOT NULL), '[]'
          ) AS categories,
          -- Imagen principal
          (SELECT url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) AS main_image
        FROM products p
        ${joinCategory} ${joinVehicle}
        LEFT JOIN product_categories pc2  ON pc2.product_id = p.id
        LEFT JOIN categories cat2         ON cat2.id = pc2.category_id
        ${where}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT $${i} OFFSET $${i + 1}
      `, [...values, limit, offset])
    ])

    const total = parseInt(countResult.rows[0].count)
    return {
      data: dataResult.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  },

  async findById(id) {
    const [product, images, compatibility, categories] = await Promise.all([
      pool.query(`
        SELECT p.id, p.name, p.slug, p.sku, p.description,
               p.price, p.brand, p.status, p.stock_status, p.is_active, p.created_at
        FROM products p WHERE p.id = $1
      `, [id]),
      pool.query(`
        SELECT id, url, alt_text, display_order
        FROM product_images WHERE product_id = $1 ORDER BY display_order ASC
      `, [id]),
      pool.query(`
        SELECT id, make, model, year_from, year_to
        FROM vehicle_compatibility WHERE product_id = $1 ORDER BY make, model
      `, [id]),
      pool.query(`
        SELECT c.id, c.name, c.slug
        FROM categories c
        INNER JOIN product_categories pc ON pc.category_id = c.id
        WHERE pc.product_id = $1
        ORDER BY c.name
      `, [id]),
    ])

    if (product.rows.length === 0) return null

    return {
      ...product.rows[0],
      images:              images.rows,
      compatible_vehicles: compatibility.rows,
      categories:          categories.rows,
    }
  },

  async findBySlug(slug) {
    const { rows } = await pool.query('SELECT id FROM products WHERE slug = $1', [slug])
    if (rows.length === 0) return null
    return this.findById(rows[0].id)
  },

  async findByIds(ids) {
    if (!ids.length) return []
    const { rows } = await pool.query(
      `SELECT id, name, price, is_active FROM products WHERE id = ANY($1)`,
      [ids]
    )
    return rows
  },

  async create({ name, slug, description, price, brand, category_ids = [], status, stock_status, images = [], compatible_vehicles = [] }) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // SKU generado automáticamente con la secuencia
      const sku = await this.generateSku()

      const { rows } = await client.query(
        `INSERT INTO products (name, slug, sku, description, price, brand, status, stock_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, slug, sku, description, price, brand, status, stock_status || 'bajo_pedido']
      )
      const product = rows[0]

      // Insertar categorías múltiples
      for (const catId of category_ids) {
        await client.query(
          `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [product.id, catId]
        )
      }

      // Insertar imágenes
      for (const [index, img] of images.entries()) {
        await client.query(
          `INSERT INTO product_images (product_id, url, alt_text, display_order) VALUES ($1, $2, $3, $4)`,
          [product.id, img.url, img.alt_text || '', img.display_order ?? index]
        )
      }

      // Insertar compatibilidades
      for (const v of compatible_vehicles) {
        await client.query(
          `INSERT INTO vehicle_compatibility (product_id, make, model, year_from, year_to) VALUES ($1, $2, $3, $4, $5)`,
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

      const allowed = ['name', 'slug', 'description', 'price', 'brand', 'status', 'stock_status', 'is_active']
      const updates = []
      const values  = []
      let i = 1

      for (const key of allowed) {
        if (fields[key] !== undefined) {
          updates.push(`${key} = $${i++}`)
          values.push(fields[key])
        }
      }

      if (updates.length > 0) {
        values.push(id)
        await client.query(`UPDATE products SET ${updates.join(', ')} WHERE id = $${i}`, values)
      }

      // Reemplazar categorías si vienen en el body
      if (fields.category_ids !== undefined) {
        await client.query('DELETE FROM product_categories WHERE product_id = $1', [id])
        for (const catId of fields.category_ids) {
          await client.query(
            `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, catId]
          )
        }
      }

      if (fields.images !== undefined) {
        await client.query('DELETE FROM product_images WHERE product_id = $1', [id])
        for (const [index, img] of fields.images.entries()) {
          await client.query(
            `INSERT INTO product_images (product_id, url, alt_text, display_order) VALUES ($1, $2, $3, $4)`,
            [id, img.url, img.alt_text || '', img.display_order ?? index]
          )
        }
      }

      if (fields.compatible_vehicles !== undefined) {
        await client.query('DELETE FROM vehicle_compatibility WHERE product_id = $1', [id])
        for (const v of fields.compatible_vehicles) {
          await client.query(
            `INSERT INTO vehicle_compatibility (product_id, make, model, year_from, year_to) VALUES ($1, $2, $3, $4, $5)`,
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
    const { rows } = await pool.query(
      'UPDATE products SET is_active = false WHERE id = $1 RETURNING id', [id]
    )
    return rows.length > 0
  },

  async slugExists(slug, excludeId = null) {
    const query  = excludeId ? 'SELECT id FROM products WHERE slug = $1 AND id != $2' : 'SELECT id FROM products WHERE slug = $1'
    const params = excludeId ? [slug, excludeId] : [slug]
    const { rows } = await pool.query(query, params)
    return rows.length > 0
  },

  async skuExists(sku, excludeId = null) {
    const query  = excludeId ? 'SELECT id FROM products WHERE sku = $1 AND id != $2' : 'SELECT id FROM products WHERE sku = $1'
    const params = excludeId ? [sku, excludeId] : [sku]
    const { rows } = await pool.query(query, params)
    return rows.length > 0
  },
}

module.exports = ProductRepository