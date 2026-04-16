const pool = require('../../config/db')

const CategoryRepository = {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category = c.slug AND p.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
    return rows
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    )
    return rows[0] || null
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    )
    return rows[0] || null
  },

  async create({ name, slug, description }) {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, description || null]
    )
    return rows[0]
  },

  async update(id, { name, slug, description }) {
    const fields = []
    const values = []
    let i = 1
    if (name !== undefined)        { fields.push(`name = $${i++}`);        values.push(name) }
    if (slug !== undefined)        { fields.push(`slug = $${i++}`);        values.push(slug) }
    if (description !== undefined) { fields.push(`description = $${i++}`); values.push(description) }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const { rows } = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )
    return rows[0] || null
  },

  async delete(id) {
    const { rows } = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    )
    return rows.length > 0
  },

  async slugExists(slug, excludeId = null) {
    const q = excludeId
      ? 'SELECT id FROM categories WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM categories WHERE slug = $1'
    const { rows } = await pool.query(q, excludeId ? [slug, excludeId] : [slug])
    return rows.length > 0
  },
}

module.exports = CategoryRepository