const pool = require('../../config/db')

const UserRepository = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    )
    return rows[0] || null
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    )
    return rows[0] || null
  },

  async create({ name, email, password, role = 'user' }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email.toLowerCase(), password, role]
    )
    return rows[0]
  },

  async emailExists(email) {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    return rows.length > 0
  },
}

module.exports = UserRepository