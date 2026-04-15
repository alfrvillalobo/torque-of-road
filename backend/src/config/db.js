const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verificación de conexión (opcional pero MUY útil)
pool.connect()
  .then(() => console.log('🟢 Conectado a PostgreSQL'))
  .catch(err => console.error('🔴 Error de conexión DB:', err));

module.exports = pool;