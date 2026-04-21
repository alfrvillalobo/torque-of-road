const ShipmentRepository = require('./shipment.repository')
const pool = require('../../config/db')

const VALID_STATUSES = ['pending', 'dispatched', 'in_transit', 'delivered', 'failed']

const ShipmentService = {
  async getAll(filters) {
    return ShipmentRepository.findAll(filters)
  },

  async getById(id) {
    const shipment = await ShipmentRepository.findById(id)
    if (!shipment) {
      const err = new Error('Envío no encontrado')
      err.status = 404; throw err
    }
    return shipment
  },

  async create(data) {
    const { order_id, destination } = data

    if (!order_id) {
      const err = new Error('El pedido (order_id) es requerido')
      err.status = 400; throw err
    }
    if (!destination?.trim()) {
      const err = new Error('La dirección de destino es requerida')
      err.status = 400; throw err
    }

    // Verificar que el pedido existe
    const { rows } = await pool.query('SELECT id, status FROM orders WHERE id = $1', [order_id])
    if (rows.length === 0) {
      const err = new Error('Pedido no encontrado')
      err.status = 404; throw err
    }
    if (rows[0].status === 'cancelled') {
      const err = new Error('No se puede crear un envío para un pedido cancelado')
      err.status = 400; throw err
    }

    return ShipmentRepository.create(data)
  },

  async update(id, data) {
    await this.getById(id)

    if (data.status && !VALID_STATUSES.includes(data.status)) {
      const err = new Error(`Estado inválido. Valores: ${VALID_STATUSES.join(', ')}`)
      err.status = 400; throw err
    }

    // Si el envío se marca como entregado, registrar la fecha automáticamente
    if (data.status === 'delivered' && !data.delivered_date) {
      data.delivered_date = new Date().toISOString().split('T')[0]
    }

    return ShipmentRepository.update(id, data)
  },
}

module.exports = ShipmentService
