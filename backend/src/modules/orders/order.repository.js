const pool = require('../../config/db')

const OrderRepository = {
  async findAll({ status, user_id } = {}) {
    const conditions = []
    const values = []
    let i = 1
    if (status)  { conditions.push(`o.status = $${i++}`);  values.push(status) }
    if (user_id) { conditions.push(`o.user_id = $${i++}`); values.push(user_id) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(`
      SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id, 'product_id', oi.product_id,
            'product_name', oi.product_name,
            'unit_price', oi.unit_price,
            'quantity', oi.quantity,
            'subtotal', oi.subtotal
          )
        ) FILTER (WHERE oi.id IS NOT NULL) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${where}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, values)
    return rows
  },

  async findById(id) {
    const { rows } = await pool.query(`
      SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id, 'product_id', oi.product_id,
            'product_name', oi.product_name,
            'unit_price', oi.unit_price,
            'quantity', oi.quantity,
            'subtotal', oi.subtotal
          )
        ) FILTER (WHERE oi.id IS NOT NULL) AS items,
        row_to_json(inst.*) AS installation
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN installations inst ON inst.id = o.installation_id
      WHERE o.id = $1
      GROUP BY o.id, inst.id
    `, [id])
    return rows[0] || null
  },

  async create({ user_id, quote_id, customer_name, customer_email, customer_phone, shipping_address, items, installation_id, notes }) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0)
      // installation_cost se actualizará si se vincula instalación
      const total = subtotal

      const { rows } = await client.query(
        `INSERT INTO orders
           (user_id, quote_id, customer_name, customer_email, customer_phone,
            shipping_address, subtotal, total, installation_id, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [user_id || null, quote_id || null, customer_name, customer_email,
         customer_phone || null, shipping_address || null,
         subtotal, total, installation_id || null, notes || null]
      )
      const order = rows[0]

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [order.id, item.product_id, item.product_name, item.unit_price, item.quantity, item.subtotal]
        )
      }

      await client.query('COMMIT')
      return this.findById(order.id)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    )
    return rows[0] || null
  },
}

module.exports = OrderRepository