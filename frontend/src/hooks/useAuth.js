import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/index'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function useLogin() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data)
      toast.success(`Bienvenido, ${data.user.name}`)
      navigate('/admin')
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || 'Credenciales incorrectas'),
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/admin/login')
  }
}
