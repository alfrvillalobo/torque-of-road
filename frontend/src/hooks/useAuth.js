import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/index'
import { useAuthStore } from '../context/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
 
// El navigate lo maneja el componente que llama al hook,
// pasándolo como callback en onSuccess. Así evitamos problemas
// con el contexto del router en el momento del montaje.
export function useLogin() {
  const login = useAuthStore((s) => s.login)
 
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data)
      toast.success(`Bienvenido, ${data.user.name}`)
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