const pool = require('../../config/db')

const SupplierRepository = {
  // Lista todos los distribuidores con cuántos productos tienen disponibles
  async findAll({ is_active } = {}) {
    const where = is_active !== undefined ? 'WHERE s.is_active = $1' : ''
    const { rows } = await pool.query(`
      SELECT
        s.*,
        COUNT(pa.id) FILTER (WHERE pa.is_available = true)::int AS available_products
      FROM suppliers s
      LEFT JOIN product_availability pa ON pa.supplier_id = s.id
      ${where}
      GROUP BY s.id
      ORDER BY s.name ASC
    `, is_active !== undefined ? [is_active] : [])
    return rows
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM suppliers WHERE id = $1',
      [id]
    )
    return rows[0] || null
  },

  // Ver qué productos tiene un distribuidor, con precio de costo y margen estimado
  async findProducts(supplierId) {
    const { rows } = await pool.query(`
      SELECT
        pa.id AS availability_id,
        pa.cost_price,
        pa.lead_days,
        pa.is_available,
        pa.notes AS availability_notes,
        pa.updated_at,
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        p.price AS sale_price,
        p.category,
        -- Margen bruto: cuánto gana Torque por unidad
        (p.price - pa.cost_price) AS gross_margin,
        -- Margen % sobre precio de venta
        CASE
          WHEN p.price > 0
          THEN ROUND(((p.price - pa.cost_price)::numeric / p.price) * 100, 1)
          ELSE 0
        END AS margin_pct
      FROM product_availability pa
      JOIN products p ON p.id = pa.product_id
      WHERE pa.supplier_id = $1
      ORDER BY p.name ASC
    `, [supplierId])
    return rows
  },

  async create({ name, contact_name, phone, email, region, notes }) {
    const { rows } = await pool.query(
      `INSERT INTO suppliers (name, contact_name, phone, email, region, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, contact_name || null, phone || null,
       email || null, region || null, notes || null]
    )
    return rows[0]
  },

  async update(id, fields) {
    const allowed = ['name', 'contact_name', 'phone', 'email', 'region', 'notes', 'is_active']
    const updates = []
    const values = []
    let i = 1
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${i++}`)
        values.push(fields[key])
      }
    }
    if (updates.length === 0) return this.findById(id)
    values.push(id)
    const { rows } = await pool.query(
      `UPDATE suppliers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
    return rows[0] || null
  },

  async delete(id) {
    // Soft delete: desactivar en lugar de borrar para preservar historial
    const { rows } = await pool.query(
      'UPDATE suppliers SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    )
    return rows.length > 0
  },
}

module.exports = SupplierRepository
