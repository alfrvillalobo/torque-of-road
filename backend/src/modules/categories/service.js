const CategoryRepository = require('./repository')

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const CategoryService = {
  async getAll() {
    return CategoryRepository.findAll()
  },

  async getById(id) {
    const cat = await CategoryRepository.findById(id)
    if (!cat) {
      const err = new Error('Categoría no encontrada')
      err.status = 404
      throw err
    }
    return cat
  },

  async getBySlug(slug) {
    const cat = await CategoryRepository.findBySlug(slug)
    if (!cat) {
      const err = new Error('Categoría no encontrada')
      err.status = 404
      throw err
    }
    return cat
  },

  async create({ name, slug, description }) {
    if (!name || name.trim().length < 2) {
      const err = new Error('El nombre debe tener al menos 2 caracteres')
      err.status = 400
      throw err
    }
    const finalSlug = slug || generateSlug(name)
    if (await CategoryRepository.slugExists(finalSlug)) {
      const err = new Error(`El slug "${finalSlug}" ya existe`)
      err.status = 409
      throw err
    }
    return CategoryRepository.create({ name: name.trim(), slug: finalSlug, description })
  },

  async update(id, data) {
    await this.getById(id)
    if (data.slug && await CategoryRepository.slugExists(data.slug, id)) {
      const err = new Error(`El slug "${data.slug}" ya existe`)
      err.status = 409
      throw err
    }
    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name)
    }
    return CategoryRepository.update(id, data)
  },

  async delete(id) {
    await this.getById(id)
    await CategoryRepository.delete(id)
    return { message: 'Categoría eliminada' }
  },
}

module.exports = CategoryService