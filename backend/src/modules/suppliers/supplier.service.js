const SupplierRepository = require('./supplier.repository')

const SupplierService = {
  async getAll(filters = {}) {
    return SupplierRepository.findAll(filters)
  },

  async getById(id) {
    const supplier = await SupplierRepository.findById(id)
    if (!supplier) {
      const err = new Error('Distribuidor no encontrado')
      err.status = 404; throw err
    }
    return supplier
  },

  // Retorna el distribuidor con sus productos y márgenes calculados
  async getWithProducts(id) {
    const supplier = await this.getById(id)
    const products = await SupplierRepository.findProducts(id)
    return { ...supplier, products }
  },

  async create(data) {
    if (!data.name || data.name.trim().length < 2) {
      const err = new Error('El nombre del distribuidor debe tener al menos 2 caracteres')
      err.status = 400; throw err
    }
    return SupplierRepository.create(data)
  },

  async update(id, data) {
    await this.getById(id)
    return SupplierRepository.update(id, data)
  },

  async delete(id) {
    await this.getById(id)
    await SupplierRepository.delete(id)
    return { message: 'Distribuidor desactivado' }
  },
}

module.exports = SupplierService
