import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Trash2, ShoppingCart, CheckCircle } from 'lucide-react'
import { useCartStore } from '../../context/cartStore'
import { quoteService } from '../../services/index'
import { formatCLP } from '../../utils/format'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CotizarPage() {
  const [sent, setSent] = useState(false)
  const { items, removeItem, updateQuantity, total, clear } = useCartStore()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const submit = useMutation({
    mutationFn: (data) => quoteService.create({
      customer_name:  data.name,
      customer_email: data.email,
      customer_phone: data.phone,
      vehicle_make:   data.vehicle_make,
      vehicle_model:  data.vehicle_model,
      vehicle_year:   data.vehicle_year ? parseInt(data.vehicle_year) : undefined,
      notes:          data.notes,
      items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    }),
    onSuccess: () => { clear(); setSent(true) },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al enviar cotización'),
  })

  if (sent) return (
    <div style={{ maxWidth: 500, margin: '6rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <CheckCircle size={52} color="#22c55e" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>¡Cotización enviada!</h2>
      <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
        Recibimos tu solicitud. Cristóbal te contactará pronto con el presupuesto y coordinaremos los detalles.
      </p>
      <Link to="/catalogo" style={{ display: 'inline-block', background: '#f97316', color: '#fff', textDecoration: 'none', padding: '0.75rem 1.75rem', borderRadius: 8, fontWeight: 600 }}>
        Seguir explorando
      </Link>
    </div>
  )

  if (items.length === 0) return (
    <div style={{ maxWidth: 500, margin: '6rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <ShoppingCart size={52} color="#ddd" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Tu cotización está vacía</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>Agrega productos desde el catálogo.</p>
      <Link to="/catalogo" style={{ display: 'inline-block', background: '#111', color: '#fff', textDecoration: 'none', padding: '0.75rem 1.75rem', borderRadius: 8, fontWeight: 500 }}>
        Ver catálogo
      </Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: '2rem' }}>Solicitar cotización</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Formulario */}
        <form onSubmit={handleSubmit((d) => submit.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Tus datos</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input {...register('name', { required: 'Requerido' })}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${errors.name ? '#ef4444' : '#ddd'}`, borderRadius: 6, fontSize: 14 }} />
              {errors.name && <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Teléfono *</label>
              <input {...register('phone', { required: 'Requerido' })} placeholder="+56 9 ..."
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${errors.phone ? '#ef4444' : '#ddd'}`, borderRadius: 6, fontSize: 14 }} />
              {errors.phone && <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Email *</label>
            <input type="email" {...register('email', { required: 'Requerido' })}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${errors.email ? '#ef4444' : '#ddd'}`, borderRadius: 6, fontSize: 14 }} />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.email.message}</p>}
          </div>

          <h3 style={{ margin: '0.5rem 0 0', fontSize: 16, fontWeight: 600 }}>Tu vehículo</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Marca</label>
              <input {...register('vehicle_make')} placeholder="Toyota, Ford..."
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Modelo</label>
              <input {...register('vehicle_model')} placeholder="Hilux, Ranger..."
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Año</label>
              <input type="number" {...register('vehicle_year')} placeholder="2020"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <textarea {...register('notes')} rows={3} placeholder="Cuéntanos el uso de tu vehículo, dudas, etc."
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, resize: 'vertical' }} />
          </div>

          <button type="submit" disabled={submit.isPending} style={{
            background: submit.isPending ? '#fdba74' : '#f97316', color: '#fff',
            border: 'none', borderRadius: 8, padding: '0.875rem',
            fontSize: 16, fontWeight: 600, cursor: submit.isPending ? 'not-allowed' : 'pointer',
          }}>
            {submit.isPending ? 'Enviando...' : 'Enviar cotización'}
          </button>
        </form>

        {/* Resumen del carrito */}
        <div style={{ background: '#f8f8f6', borderRadius: 10, padding: '1.5rem', position: 'sticky', top: 80 }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: 16, fontWeight: 600 }}>
            Tu cotización ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{formatCLP(item.price)} c/u</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}>-</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
            <span>Total estimado</span>
            <span>{formatCLP(total)}</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#888' }}>
            * El precio final puede variar según disponibilidad e instalación.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
