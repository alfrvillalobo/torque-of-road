const ProductRepository = require('./repository')
 
// Genera un slug limpio desde el nombre del producto
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
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
    // Validaciones de negocio
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
 
    // Generar slug si no viene
    const slug = data.slug || generateSlug(data.name)
 
    // Verificar unicidad
    if (await ProductRepository.slugExists(slug)) {
      const err = new Error(`El slug "${slug}" ya está en uso`)
      err.status = 409
      throw err
    }
    if (data.sku && await ProductRepository.skuExists(data.sku)) {
      const err = new Error(`El SKU "${data.sku}" ya está en uso`)
      err.status = 409
      throw err
    }
 
    return ProductRepository.create({ ...data, slug })
  },
 
  async update(id, data) {
    // Verificar que el producto existe
    await this.getById(id)
 
    // Si viene un nuevo slug, verificar que no esté tomado por otro producto
    if (data.slug) {
      if (await ProductRepository.slugExists(data.slug, id)) {
        const err = new Error(`El slug "${data.slug}" ya está en uso`)
        err.status = 409
        throw err
      }
    }
 
    // Si viene nuevo nombre sin slug explícito, regenerar slug
    if (data.name && !data.slug) {
      const newSlug = generateSlug(data.name)
      if (await ProductRepository.slugExists(newSlug, id)) {
        // Si el nuevo slug choca, agregamos el id al final
        data.slug = `${newSlug}-${id}`
      } else {
        data.slug = newSlug
      }
    }
 
    if (data.sku && await ProductRepository.skuExists(data.sku, id)) {
      const err = new Error(`El SKU "${data.sku}" ya está en uso`)
      err.status = 409
      throw err
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
 
  // Lógica de negocio específica: buscar productos compatibles con un vehículo
  async getCompatibleWithVehicle({ make, model, year }) {
    if (!make || !model) {
      const err = new Error('Se requiere marca (make) y modelo (model) del vehículo')
      err.status = 400
      throw err
    }
    return ProductRepository.findAll({ make, model, year })
  },
}
 
module.exports = ProductService