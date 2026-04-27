const QuoteRepository   = require('./quote.repository')
const ProductRepository = require('../products/repository')

const VALID_STATUSES = ['pending', 'reviewed', 'approved', 'rejected']

// Fix #8: rango de años válidos para vehículos
const YEAR_MIN = 1980
const YEAR_MAX = new Date().getFullYear() + 1  // permite el modelo del año siguiente

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
    if (!items || items.length === 0) {
      const err = new Error('La cotización debe tener al menos un producto')
      err.status = 400; throw err
    }

    // Fix #8: validar rango de año del vehículo si viene informado
    if (vehicle_year !== undefined && vehicle_year !== null) {
      const year = parseInt(vehicle_year)
      if (isNaN(year) || year < YEAR_MIN || year > YEAR_MAX) {
        const err = new Error(`El año del vehículo debe estar entre ${YEAR_MIN} y ${YEAR_MAX}`)
        err.status = 400; throw err
      }
    }

    // Fix #9: recolectar TODOS los productos con problemas antes de lanzar el error
    // así el cliente sabe exactamente qué productos no están disponibles,
    // no solo el primero que falló
    const enrichedItems  = []
    const unavailable    = []

    for (const item of items) {
      const product = await ProductRepository.findById(item.product_id)

      if (!product) {
        unavailable.push(`Producto con id ${item.product_id} no encontrado`)
        continue
      }
      if (!product.is_active) {
        // Fix #9: mensaje descriptivo con el nombre real del producto
        unavailable.push(`"${product.name}" ya no está disponible`)
        continue
      }

      enrichedItems.push({
        product_id:   product.id,
        product_name: product.name,
        unit_price:   product.price,   // siempre precio real desde DB, nunca del cliente
        quantity:     item.quantity || 1,
      })
    }

    // Fix #9: si hay productos con problema, informar todos juntos en un solo error
    if (unavailable.length > 0) {
      const err = new Error(
        `Los siguientes productos no están disponibles: ${unavailable.join(', ')}. ` +
        `Por favor retíralos de tu cotización e intenta nuevamente.`
      )
      err.status = 400
      err.unavailable_products = unavailable  // útil si el frontend quiere procesar la lista
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
}

module.exports = QuoteService