const OrderRepository = require('./order.repository')
const QuoteRepository = require('../quotes/quote.repository')
const InstallationRepository = require('../installations/installation.repository')

const VALID_STATUSES = ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled']

const OrderService = {
  async getAll(filters) {
    return OrderRepository.findAll(filters)
  },

  async getById(id) {
    const order = await OrderRepository.findById(id)
    if (!order) {
      const err = new Error('Pedido no encontrado')
      err.status = 404; throw err
    }
    return order
  },

  // Crear pedido desde una cotización aprobada
  async createFromQuote(quoteId, extraData) {
    const quote = await QuoteRepository.findById(quoteId)
    if (!quote) {
      const err = new Error('Cotización no encontrada')
      err.status = 404; throw err
    }
    if (quote.status !== 'approved') {
      const err = new Error('Solo se pueden convertir cotizaciones aprobadas en pedidos')
      err.status = 400; throw err
    }

    const items = (quote.items || []).map(item => ({
      product_id:   item.product_id,
      product_name: item.product_name,
      unit_price:   item.unit_price,
      quantity:     item.quantity,
      subtotal:     item.subtotal,
    }))

    return OrderRepository.create({
      user_id:          quote.user_id,
      quote_id:         quote.id,
      customer_name:    extraData.customer_name  || quote.customer_name,
      customer_email:   extraData.customer_email || quote.customer_email,
      customer_phone:   extraData.customer_phone || quote.customer_phone,
      shipping_address: extraData.shipping_address || null,
      installation_id:  extraData.installation_id || null,
      notes:            extraData.notes || null,
      items,
    })
  },

  async updateStatus(id, status) {
    await this.getById(id)
    if (!VALID_STATUSES.includes(status)) {
      const err = new Error(`Estado inválido. Valores: ${VALID_STATUSES.join(', ')}`)
      err.status = 400; throw err
    }
    return OrderRepository.updateStatus(id, status)
  },
}

module.exports = OrderService