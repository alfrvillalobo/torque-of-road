const QuoteRepository   = require('./quote.repository')
const ProductRepository = require('../products/repository')

const VALID_STATUSES = ['pending', 'reviewed', 'approved', 'rejected']

const YEAR_MIN = 1980
const YEAR_MAX = new Date().getFullYear() + 1

const QuoteService = {
  async getAll(filters) {
    return QuoteRepository.findAll(filters)
  },

  async getById(id) {
    const quote = await QuoteRepository.findById(id)
    if (!quote) {
      const err = new Error('Cotización no encontrada')
      err.status = 404; throw err
    }
    return quote
  },

  async create(data) {
    const { customer_name, customer_email, items, vehicle_year } = data

    if (!customer_name?.trim()) {
      const err = new Error('El nombre del cliente es requerido')
      err.status = 400; throw err
    }
    if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      const err = new Error('Email del cliente inválido')
      err.status = 400; throw err
    }
    if (!Array.isArray(items) || items.length === 0) {
      const err = new Error('La cotización debe tener al menos un producto')
      err.status = 400; throw err
    }

    if (vehicle_year !== undefined && vehicle_year !== null) {
      const year = parseInt(vehicle_year)
      if (isNaN(year) || year < YEAR_MIN || year > YEAR_MAX) {
        const err = new Error(`El año del vehículo debe estar entre ${YEAR_MIN} y ${YEAR_MAX}`)
        err.status = 400; throw err
      }
    }

    const productIds = items.map((i) => i.product_id)
    const products   = await ProductRepository.findByIds(productIds)

    const productMap = {}
    for (const p of products) productMap[p.id] = p

    const enrichedItems = []
    const unavailable   = []

    for (const item of items) {
      const product = productMap[item.product_id]
      if (!product) {
        unavailable.push(`Producto con id ${item.product_id} no encontrado`)
        continue
      }
      if (!product.is_active) {
        unavailable.push(`"${product.name}" ya no está disponible`)
        continue
      }
      enrichedItems.push({
        product_id:   product.id,
        product_name: product.name,
        unit_price:   product.price,
        quantity:     item.quantity || 1,
      })
    }

    if (unavailable.length > 0) {
      const err = new Error(
        `Los siguientes productos no están disponibles: ${unavailable.join(', ')}. ` +
        `Por favor retíralos de tu cotización e intenta nuevamente.`
      )
      err.status = 400
      err.unavailable_products = unavailable
      throw err
    }

    return QuoteRepository.create({ ...data, items: enrichedItems })
  },

  async updateStatus(id, status) {
    await this.getById(id)
    if (!VALID_STATUSES.includes(status)) {
      const err = new Error(`Estado inválido. Valores posibles: ${VALID_STATUSES.join(', ')}`)
      err.status = 400; throw err
    }
    return QuoteRepository.updateStatus(id, status)
  },

  // Actualiza el costo de instalación — solo admin
  async updateInstallationCost(id, installationCost) {
    await this.getById(id)
    const cost = parseInt(installationCost)
    if (isNaN(cost) || cost < 0) {
      const err = new Error('El costo de instalación debe ser un número positivo')
      err.status = 400; throw err
    }
    return QuoteRepository.updateInstallationCost(id, cost)
  },
}

module.exports = QuoteService