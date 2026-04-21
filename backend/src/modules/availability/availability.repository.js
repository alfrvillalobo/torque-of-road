const pool = require('../../config/db')

const AvailabilityRepository = {
  // Ver todos los distribuidores que tienen un producto específico
  async findByProduct(productId) {
    const { rows } = await pool.query(`
      SELECT
        pa.*,
        s.name AS supplier_name,
        s.contact_name,
        s.phone AS supplier_phone,
        s.email AS supplier_email,
        s.region AS supplier_region
      FROM product_availability pa
      JOIN suppliers s ON s.id = pa.supplier_id
      WHERE pa.product_id = $1 AND s.is_active = true
      ORDER BY pa.cost_price ASC    -- ordenar de más barato a más caro
    `, [productId])
    return rows
  },

  // Ver el distribuidor más barato disponible para un producto
  async findCheapest(productId) {
    const { rows } = await pool.query(`
      SELECT
        pa.*,
        s.name AS supplier_name,
        s.contact_name,
        s.phone AS supplier_phone
      FROM product_availability pa
      JOIN suppliers s ON s.id = pa.supplier_id
      WHERE pa.product_id = $1
        AND pa.is_available = true
        AND s.is_active = true
      ORDER BY pa.cost_price ASC
      LIMIT 1
    `, [productId])
    return rows[0] || null
  },

  async findOne(productId, supplierId) {
    const { rows } = await pool.query(
      'SELECT * FROM product_availability WHERE product_id = $1 AND supplier_id = $2',
      [productId, supplierId]
    )
    return rows[0] || null
  },

  // Registrar o actualizar disponibilidad (upsert)
  async upsert({ product_id, supplier_id, cost_price, lead_days, is_available, notes }) {
    const { rows } = await pool.query(`
      INSERT INTO product_availability
        (product_id, supplier_id, cost_price, lead_days, is_available, notes, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6, CURRENT_TIMESTAMP)
      ON CONFLICT (product_id, supplier_id)
      DO UPDATE SET
        cost_price   = EXCLUDED.cost_price,
        lead_days    = EXCLUDED.lead_days,
        is_available = EXCLUDED.is_available,
        notes        = EXCLUDED.notes,
        updated_at   = CURRENT_TIMESTAMP
      RETURNING *
    `, [product_id, supplier_id, cost_price, lead_days ?? 3, is_available ?? true, notes || null])
    return rows[0]
  },

  async delete(productId, supplierId) {
    const { rows } = await pool.query(
      'DELETE FROM product_availability WHERE product_id = $1 AND supplier_id = $2 RETURNING id',
      [productId, supplierId]
    )
    return rows.length > 0
  },
}

module.exports = AvailabilityRepository
