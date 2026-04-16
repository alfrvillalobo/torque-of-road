const InstallationRepository = require('./installation.repository')

const VALID_STATUSES = ['pending', 'scheduled', 'completed', 'cancelled']

const InstallationService = {
  async getAll(filters) {
    return InstallationRepository.findAll(filters)
  },

  async getById(id) {
    const inst = await InstallationRepository.findById(id)
    if (!inst) {
      const err = new Error('Instalación no encontrada')
      err.status = 404; throw err
    }
    return inst
  },

  // Regla de negocio central: customer_price = mechanic_cost + torque_margin
  async create(data) {
    const { mechanic_cost, torque_margin } = data
    if (!mechanic_cost || mechanic_cost <= 0) {
      const err = new Error('El costo del mecánico debe ser mayor a 0')
      err.status = 400; throw err
    }
    if (torque_margin === undefined || torque_margin < 0) {
      const err = new Error('El margen de Torque es requerido y debe ser >= 0')
      err.status = 400; throw err
    }
    return InstallationRepository.create(data)
  },

  async update(id, data) {
    await this.getById(id)
    if (data.status && !VALID_STATUSES.includes(data.status)) {
      const err = new Error(`Estado inválido. Valores: ${VALID_STATUSES.join(', ')}`)
      err.status = 400; throw err
    }
    if (data.mechanic_cost !== undefined && data.mechanic_cost <= 0) {
      const err = new Error('El costo del mecánico debe ser mayor a 0')
      err.status = 400; throw err
    }
    return InstallationRepository.update(id, data)
  },

  // Utilidad: calcular precio final para mostrar al cliente antes de crear
  calculatePrice({ mechanic_cost, torque_margin }) {
    if (!mechanic_cost || torque_margin === undefined) {
      const err = new Error('Se requieren mechanic_cost y torque_margin')
      err.status = 400; throw err
    }
    return {
      mechanic_cost,
      torque_margin,
      customer_price: mechanic_cost + torque_margin,
      margin_percentage: Math.round((torque_margin / mechanic_cost) * 100),
    }
  },
}

module.exports = InstallationService