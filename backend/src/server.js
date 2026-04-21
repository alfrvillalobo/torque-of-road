require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { errorHandler, notFound } = require('./middlewares/errorHandler')

const authRoutes         = require('./modules/auth/auth.routes')
const productRoutes      = require('./modules/products/routes')
const categoryRoutes     = require('./modules/categories/routes')
const quoteRoutes        = require('./modules/quotes/quote.routes')
const installationRoutes = require('./modules/installations/installation.routes')
const orderRoutes        = require('./modules/orders/order.routes')
const supplierRoutes     = require('./modules/suppliers/supplier.routes')
const availabilityRoutes = require('./modules/availability/availability.routes')
const shipmentRoutes     = require('./modules/shipments/shipment.routes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'Torque Off Road API', timestamp: new Date() })
})

app.use('/api/auth',          authRoutes)
app.use('/api/products',      productRoutes)
app.use('/api/categories',    categoryRoutes)
app.use('/api/quotes',        quoteRoutes)
app.use('/api/installations', installationRoutes)
app.use('/api/orders',        orderRoutes)
app.use('/api/suppliers',     supplierRoutes)
app.use('/api/availability',  availabilityRoutes)
app.use('/api/shipments',     shipmentRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})