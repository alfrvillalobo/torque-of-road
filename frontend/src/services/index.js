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
  getAll: (params) =>
    api.get('/quotes', { params }).then((r) => r.data.data),

  getById: (id) =>
    api.get(`/quotes/${id}`).then((r) => r.data.data),

  create: (data) =>
    api.post('/quotes', data).then((r) => r.data.data),

  updateStatus: (id, status) =>
    api.patch(`/quotes/${id}/status`, { status }).then((r) => r.data.data),
}

export const orderService = {
  getAll: (params) =>
    api.get('/orders', { params }).then((r) => r.data.data),

  getById: (id) =>
    api.get(`/orders/${id}`).then((r) => r.data.data),

  createFromQuote: (quoteId, data) =>
    api.post(`/orders/from-quote/${quoteId}`, data).then((r) => r.data.data),

  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }).then((r) => r.data.data),
}
