const pool = require('../config/db');

const createProduct = async (data) => {
  const {
    name,
    description,
    price,
    image_url,
    brand,
    category
  } = data;

  const query = `
    INSERT INTO products (name, description, price, image_url, brand, category)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [name, description, price, image_url, brand, category];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getProducts = async () => {
  const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  return result.rows;
};

module.exports = {
  createProduct,
  getProducts,
};