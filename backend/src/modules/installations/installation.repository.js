const pool = require('../../config/db')

const InstallationRepository = {
  async findAll({ status } = {}) {
    const where = status ? 'WHERE status = $1' : ''
    const { rows } = await pool.query(
      `SELECT * FROM installations ${where} ORDER BY created_at DESC`,
      status ? [status] : []
    )
    return rows
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM installations WHERE id = $1', [id]
    )
    return rows[0] || null
  },

  async create({ quote_id, order_id, mechanic_name, mechanic_cost, torque_margin, scheduled_date, address, notes }) {
    const customer_price = mechanic_cost + torque_margin
    const { rows } = await pool.query(
      `INSERT INTO installations
         (quote_id, order_id, mechanic_name, mechanic_cost, torque_margin, customer_price, scheduled_date, address, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [quote_id || null, order_id || null, mechanic_name, mechanic_cost, torque_margin,
       customer_price, scheduled_date || null, address || null, notes || null]
    )
    return rows[0]
  },

  async update(id, fields) {
    const allowed = ['mechanic_name', 'mechanic_cost', 'torque_margin', 'scheduled_date', 'address', 'status', 'notes', 'order_id']
    const updates = []
    const values = []
    let i = 1
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${i++}`)
        values.push(fields[key])
      }
    }
    // Recalcular customer_price si cambian costos
    if (fields.mechanic_cost !== undefined || fields.torque_margin !== undefined) {
      updates.push(`customer_price = $${i++}`)
      // Recuperar valores actuales si solo viene uno de los dos
      const current = await this.findById(id)
      const mc = fields.mechanic_cost  ?? current.mechanic_cost
      const tm = fields.torque_margin  ?? current.torque_margin
      values.push(mc + tm)
    }
    if (updates.length === 0) return this.findById(id)
    values.push(id)
    const { rows } = await pool.query(
      `UPDATE installations SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
    return rows[0] || null
  },
}

module.exports = InstallationRepository