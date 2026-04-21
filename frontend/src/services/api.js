import axios from 'axios'
import { useAuthStore } from '../context/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Antes de cada request: adjunta el token si existe
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el servidor responde 401, cerrar sesión automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api
