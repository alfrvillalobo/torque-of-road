const ProductRepository = require('./repository')

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const ProductService = {
  async getAll(filters = {}) {
    return ProductRepository.findAll(filters)
  },

  async getById(id) {
    const product = await ProductRepository.findById(id)
    if (!product) {
      const err = new Error('Producto no encontrado')
      err.status = 404
      throw err
    }
    return product
  },

  async getBySlug(slug) {
    const product = await ProductRepository.findBySlug(slug)
    if (!product) {
      const err = new Error('Producto no encontrado')
      err.status = 404
      throw err
    }
    return product
  },

  async create(data) {
    if (!data.name || data.name.trim().length < 3) {
      const err = new Error('El nombre del producto debe tener al menos 3 caracteres')
      err.status = 400
      throw err
    }
    if (!data.price || data.price <= 0) {
      const err = new Error('El precio debe ser mayor a 0')
      err.status = 400
      throw err
    }

    // Slug generado desde el nombre — el SKU lo genera el repository automáticamente
    const slug = generateSlug(data.name)

    if (await ProductRepository.slugExists(slug)) {
      const err = new Error(`Ya existe un producto con un nombre muy similar. Intenta con un nombre diferente.`)
      err.status = 409
      throw err
    }

    // category_ids debe ser un array de IDs numéricos
    const category_ids = Array.isArray(data.category_ids)
      ? data.category_ids.map(Number).filter(Boolean)
      : []

    return ProductRepository.create({ ...data, slug, category_ids })
  },

  async update(id, data) {
    await this.getById(id)

    if (data.name && !data.slug) {
      const newSlug = generateSlug(data.name)
      data.slug = (await ProductRepository.slugExists(newSlug, id))
        ? `${newSlug}-${id}`
        : newSlug
    }

    if (data.slug && await ProductRepository.slugExists(data.slug, id)) {
      const err = new Error(`El slug "${data.slug}" ya está en uso`)
      err.status = 409
      throw err
    }

    // Normalizar category_ids si vienen
    if (data.category_ids !== undefined) {
      data.category_ids = Array.isArray(data.category_ids)
        ? data.category_ids.map(Number).filter(Boolean)
        : []
    }

    return ProductRepository.update(id, data)
  },

  async delete(id) {
    await this.getById(id)
    const deleted = await ProductRepository.delete(id)
    if (!deleted) {
      const err = new Error('No se pudo eliminar el producto')
      err.status = 500
      throw err
    }
    return { message: 'Producto desactivado correctamente' }
  },

  async getCompatibleWithVehicle({ make, model, year, page, limit }) {
    if (!make || !model) {
      const err = new Error('Se requiere marca (make) y modelo (model) del vehículo')
      err.status = 400
      throw err
    }
    return ProductRepository.findAll({ make, model, year, page, limit })
  },
}

module.exports = ProductService