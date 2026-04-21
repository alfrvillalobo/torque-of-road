import api from './api'

export const productService = {
  getAll: (params = {}) =>
    api.get('/products', { params }).then((r) => r.data.data),

  getById: (id) =>
    api.get(`/products/${id}`).then((r) => r.data.data),

  getBySlug: (slug) =>
    api.get(`/products/slug/${slug}`).then((r) => r.data.data),

  getCompatible: (params) =>
    api.get('/products/compatible', { params }).then((r) => r.data.data),

  create: (data) =>
    api.post('/products', data).then((r) => r.data.data),

  update: (id, data) =>
    api.put(`/products/${id}`, data).then((r) => r.data.data),

  delete: (id) =>
    api.delete(`/products/${id}`).then((r) => r.data),
}
