import { useForm } from 'react-hook-form'
import { useLogin } from '../../hooks/useAuth'
import { Truck, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { mutate: login, isPending } = useLogin()
  const [showPass, setShowPass] = useState(false)

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
          <p style={{ color: '#888', fontSize: 14 }}>Ingresa a tu panel de administración</p>
        </div>

        <form onSubmit={handleSubmit((data) => login(data))} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="admin@torque.cl"
              {...register('email', { required: 'El email es requerido' })}
              style={{
                width: '100%', padding: '0.65rem 0.875rem',
                border: `1px solid ${errors.email ? '#ef4444' : '#ddd'}`,
                borderRadius: 8, fontSize: 15, outline: 'none',
              }}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { required: 'La contraseña es requerida' })}
                style={{
                  width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.875rem',
                  border: `1px solid ${errors.password ? '#ef4444' : '#ddd'}`,
                  borderRadius: 8, fontSize: 15, outline: 'none',
                }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isPending} style={{
            background: isPending ? '#fdba74' : '#f97316', color: '#fff',
            border: 'none', borderRadius: 8, padding: '0.75rem',
            fontSize: 15, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer',
          }}>
            {isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
