const AvailabilityRepository = require('./availability.repository')
const ProductRepository = require('../products/repository')
const SupplierRepository = require('../suppliers/supplier.repository')

const AvailabilityService = {
  // Todos los distribuidores que tienen un producto, con sus precios de costo
  async getByProduct(productId) {
    const product = await ProductRepository.findById(productId)
    if (!product) {
      const err = new Error('Producto no encontrado')
      err.status = 404; throw err
    }
    const availability = await AvailabilityRepository.findByProduct(productId)
    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        sale_price: product.price,
      },
      suppliers: availability,
    }
  },

  // El distribuidor más barato para un producto (útil al confirmar pedidos)
  async getCheapest(productId) {
    const cheapest = await AvailabilityRepository.findCheapest(productId)
    if (!cheapest) {
      const err = new Error('No hay disponibilidad registrada para este producto')
      err.status = 404; throw err
    }
    return cheapest
  },

  // Registrar o actualizar disponibilidad de un producto en un distribuidor
  async upsert({ product_id, supplier_id, cost_price, lead_days, is_available, notes }) {
    if (!product_id || !supplier_id) {
      const err = new Error('product_id y supplier_id son requeridos')
      err.status = 400; throw err
    }
    if (!cost_price || cost_price <= 0) {
      const err = new Error('El precio de costo debe ser mayor a 0')
      err.status = 400; throw err
    }

    // Verificar que existen producto y distribuidor
    const [product, supplier] = await Promise.all([
      ProductRepository.findById(product_id),
      SupplierRepository.findById(supplier_id),
    ])
    if (!product) {
      const err = new Error('Producto no encontrado'); err.status = 404; throw err
    }
    if (!supplier) {
      const err = new Error('Distribuidor no encontrado'); err.status = 404; throw err
    }

    const record = await AvailabilityRepository.upsert({ product_id, supplier_id, cost_price, lead_days, is_available, notes })

    // Calcular y retornar margen como dato de contexto útil para el admin
    return {
      ...record,
      sale_price:    product.price,
      gross_margin:  product.price - cost_price,
      margin_pct:    product.price > 0
        ? Math.round(((product.price - cost_price) / product.price) * 100)
        : 0,
    }
  },

  async remove(productId, supplierId) {
    const deleted = await AvailabilityRepository.delete(productId, supplierId)
    if (!deleted) {
      const err = new Error('Disponibilidad no encontrada')
      err.status = 404; throw err
    }
    return { message: 'Disponibilidad eliminada' }
  },
}

module.exports = AvailabilityService
