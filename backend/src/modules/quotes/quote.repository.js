const pool = require('../../config/db')

const QuoteRepository = {
  async findAll({ status, user_id } = {}) {
    const conditions = []
    const values = []
    let i = 1
    if (status)  { conditions.push(`q.status = $${i++}`);  values.push(status) }
    if (user_id) { conditions.push(`q.user_id = $${i++}`); values.push(user_id) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(`
      SELECT q.*,
        json_agg(
          json_build_object(
            'id', qi.id,
            'product_id', qi.product_id,
            'product_name', qi.product_name,
            'unit_price', qi.unit_price,
            'quantity', qi.quantity,
            'subtotal', qi.subtotal
          )
        ) FILTER (WHERE qi.id IS NOT NULL) AS items
      FROM quotes q
      LEFT JOIN quote_items qi ON qi.quote_id = q.id
      ${where}
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `, values)
    return rows
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT q.*,
        json_agg(
          json_build_object(
            'id', qi.id,
            'product_id', qi.product_id,
            'product_name', qi.product_name,
            'unit_price', qi.unit_price,
            'quantity', qi.quantity,
            'subtotal', qi.subtotal
          )
        ) FILTER (WHERE qi.id IS NOT NULL) AS items
      FROM quotes q
      LEFT JOIN quote_items qi ON qi.quote_id = q.id
      WHERE q.id = $1
      GROUP BY q.id
    `, [id])
    return rows[0] || null
  },

  async create({ user_id, customer_name, customer_email, customer_phone, vehicle_make, vehicle_model, vehicle_year, notes, items }) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Calcular total desde los ítems
      const total = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)

      const { rows } = await client.query(
        `INSERT INTO quotes (user_id, customer_name, customer_email, customer_phone,
           vehicle_make, vehicle_model, vehicle_year, notes, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [user_id || null, customer_name, customer_email, customer_phone,
         vehicle_make, vehicle_model, vehicle_year || null, notes || null, total]
      )
      const quote = rows[0]

      for (const item of items) {
        const subtotal = item.unit_price * item.quantity
        await client.query(
          `INSERT INTO quote_items (quote_id, product_id, product_name, unit_price, quantity, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [quote.id, item.product_id, item.product_name, item.unit_price, item.quantity, subtotal]
        )
      }

      await client.query('COMMIT')
      return this.findById(quote.id)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE quotes SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    )
    return rows[0] || null
  },
}

module.exports = QuoteRepository