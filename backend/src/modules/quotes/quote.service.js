const QuoteRepository = require('./quote.repository')
const ProductRepository = require('../products/product.repository')

const VALID_STATUSES = ['pending', 'reviewed', 'approved', 'rejected']

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
    const { customer_name, customer_email, items } = data

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

    // Verificar productos y usar precios actuales de la DB (no confiar en el cliente)
    const enrichedItems = []
    for (const item of items) {
      const product = await ProductRepository.findById(item.product_id)
      if (!product) {
        const err = new Error(`Producto con id ${item.product_id} no encontrado`)
        err.status = 404; throw err
      }
      if (!product.is_active) {
        const err = new Error(`El producto "${product.name}" no está disponible`)
        err.status = 400; throw err
      }
      enrichedItems.push({
        product_id:   product.id,
        product_name: product.name,
        unit_price:   product.price,   // precio real desde DB
        quantity:     item.quantity || 1,
      })
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