import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../services/index'
import { useAuthStore } from '../../context/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  const login    = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!email)    newErrors.email    = 'El email es requerido'
    if (!password) newErrors.password = 'La contraseña es requerida'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setErrors({})

    setLoading(true)
    try {
      const data = await authService.login({ email, password })
      login(data)
      toast.success(`Bienvenido, ${data.user.name}`)
      navigate('/admin', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '0.65rem 0.875rem',
    border: `1px solid ${hasError ? '#ef4444' : '#ddd'}`,
    borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#111',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '2.5rem',
        width: '100%', maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Truck size={28} color="#f97316" />
            <span style={{ fontWeight: 700, fontSize: 20 }}>
              Torque <span style={{ color: '#f97316' }}>Admin</span>
            </span>
          </div>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Ingresa a tu panel de administración</p>
        </div>

        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="admin@torque.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle(errors.email)}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{errors.email}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle(errors.password), paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#fdba74' : '#f97316',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '0.75rem', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}