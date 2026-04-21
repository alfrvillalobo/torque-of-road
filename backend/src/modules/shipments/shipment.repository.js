const pool = require('../../config/db')

const ShipmentRepository = {
  async findAll({ status, order_id } = {}) {
    const conditions = []
    const values = []
    let i = 1
    if (status)   { conditions.push(`s.status = $${i++}`);   values.push(status) }
    if (order_id) { conditions.push(`s.order_id = $${i++}`); values.push(order_id) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(`
      SELECT
        s.*,
        sup.name AS supplier_name,
        o.customer_name,
        o.customer_email
      FROM shipments s
      LEFT JOIN suppliers sup ON sup.id = s.supplier_id
      LEFT JOIN orders o ON o.id = s.order_id
      ${where}
      ORDER BY s.created_at DESC
    `, values)
    return rows
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        s.*,
        sup.name AS supplier_name,
        sup.phone AS supplier_phone,
        o.customer_name,
        o.customer_email,
        o.customer_phone
      FROM shipments s
      LEFT JOIN suppliers sup ON sup.id = s.supplier_id
      LEFT JOIN orders o ON o.id = s.order_id
      WHERE s.id = $1
    `, [id])
    return rows[0] || null
  },

  async create({ order_id, supplier_id, tracking_number, carrier, shipping_cost, estimated_date, destination, notes }) {
    const { rows } = await pool.query(`
      INSERT INTO shipments
        (order_id, supplier_id, tracking_number, carrier, shipping_cost, estimated_date, destination, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `, [order_id, supplier_id || null, tracking_number || null, carrier || null,
        shipping_cost || 0, estimated_date || null, destination, notes || null])
    return rows[0]
  },

  async update(id, fields) {
    const allowed = ['tracking_number', 'carrier', 'shipping_cost', 'estimated_date', 'delivered_date', 'destination', 'status', 'notes', 'supplier_id']
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
      `UPDATE shipments SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
    return rows[0] || null
  },
}

module.exports = ShipmentRepository
