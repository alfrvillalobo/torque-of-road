require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { errorHandler, notFound } = require('./middlewares/errorHandler')
const productRoutes = require('./modules/products/product.routes')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'Torque Off Road API', timestamp: new Date() })
})

// Rutas
app.use('/api/products', productRoutes)

// 404 y manejo de errores (siempre al final)
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})