// app.js

const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
const contactRoutes = require('./routes/contact.routes');
const productRoutes = require('./routes/product.routes');

app.use('/api/products', productRoutes);

app.use('/api/contact', contactRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'API funcionando 🚀' });
});

// Middleware de errores (SIEMPRE al final)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;