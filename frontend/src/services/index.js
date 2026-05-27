import api from './api'

export const authService = {
  login: (data) =>
    api.post('/auth/login', data).then((r) => r.data.data),

  register: (data) =>
    api.post('/auth/register', data).then((r) => r.data.data),

  me: () =>
    api.get('/auth/me').then((r) => r.data.data),
}

export const categoryService = {
  getAll: () =>
    api.get('/categories').then((r) => r.data.data),

  create: (data) =>
    api.post('/categories', data).then((r) => r.data.data),

  update: (id, data) =>
    api.put(`/categories/${id}`, data).then((r) => r.data.data),

  delete: (id) =>
    api.delete(`/categories/${id}`).then((r) => r.data),
}

export const quoteService = {
  // Retorna { data: [], pagination: { total, page, limit, totalPages } }
  getAll: (params) =>
    api.get('/quotes', { params }).then((r) => ({
      data:       r.data.data,
      pagination: r.data.pagination,
    })),

  getById: (id) =>
    api.get(`/quotes/${id}`).then((r) => r.data.data),

  create: (data) =>
    api.post('/quotes', data).then((r) => r.data.data),

  updateStatus: (id, status) =>
    api.patch(`/quotes/${id}/status`, { status }).then((r) => r.data.data),

  approveAndConvert: (id) =>
    api.post(`/quotes/${id}/approve-and-convert`).then((r) => r.data),

  updateInstallationCost: (id, cost) =>
    api.patch(`/quotes/${id}/installation-cost`, { installation_cost: cost }).then((r) => r.data.data),

  delete: (id) =>
    api.delete(`/quotes/${id}`).then((r) => r.data),
}

export const orderService = {
  // Retorna { data: [], pagination: { total, page, limit, totalPages } }
  getAll: (params) =>
    api.get('/orders', { params }).then((r) => ({
      data:       r.data.data,
      pagination: r.data.pagination,
    })),

  getById: (id) =>
    api.get(`/orders/${id}`).then((r) => r.data.data),

  createFromQuote: (quoteId, data) =>
    api.post(`/orders/from-quote/${quoteId}`, data).then((r) => r.data.data),

  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }).then((r) => r.data.data),
}