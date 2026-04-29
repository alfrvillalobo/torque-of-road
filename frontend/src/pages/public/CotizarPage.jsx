import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Trash2, ShoppingCart, CheckCircle, Wrench, AlertCircle } from 'lucide-react'
import { useCartStore, selectCount, selectTotal } from '../../context/cartStore'
import { quoteService } from '../../services/index'
import { formatCLP } from '../../utils/format'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CotizarPage() {
  const [sent, setSent] = useState(false)
  const [wantsInstall, setWantsInstall] = useState(false)
  const [unavailableProducts, setUnavailableProducts] = useState([])
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clear = useCartStore((s) => s.clear)
  const count = useCartStore(selectCount)
  const total = useCartStore(selectTotal)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const submit = useMutation({
    mutationFn: (data) => {
      let notes = data.notes || ''
      if (wantsInstall) {
        notes += `\n\n--- Solicita instalación ---`
        if (data.install_address) notes += `\nDirección: ${data.install_address}`
        if (data.install_date) notes += `\nFecha preferida: ${data.install_date}`
      }
      return quoteService.create({
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year ? parseInt(data.vehicle_year) : undefined,
        notes: notes.trim(),
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      })
    },
    onSuccess: () => {
      setUnavailableProducts([])
      clear()
      setSent(true)
    },
    onError: (err) => {
      const message = err.response?.data?.error || 'Error al enviar cotización'
      if (err.response?.data?.error?.includes('no están disponibles')) {
        const match = message.match(/: (.+)\. Por favor/)
        if (match) {
          const names = match[1].split(', ').map((n) => n.replace(/^"|"$/g, ''))
          setUnavailableProducts(names)
        }
        toast.error('Algunos productos ya no están disponibles. Revisa tu cotización.')
      } else {
        toast.error(message)
      }
    },
  })

  const inputStyle = (hasError) => ({
    width: '100%', padding: '0.6rem 0.75rem',
    border: `1px solid ${hasError ? '#ef4444' : '#ddd'}`,
    borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none',
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
      {unavailableProducts.length > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 14, color: '#991b1b' }}>
              Los siguientes productos ya no están disponibles:
            </p>
            <ul style={{ margin: '0 0 8px', paddingLeft: 18 }}>
              {unavailableProducts.map((name, i) => (
                <li key={i} style={{ fontSize: 13, color: '#b91c1c', marginBottom: 2 }}>{name}</li>
              ))}
            </ul>
            <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>
              Retíralos de tu cotización para continuar.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit((d) => submit.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Tus datos</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input {...register('name', { required: 'Requerido' })} style={inputStyle(errors.name)} />
              {errors.name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Teléfono *</label>
              <input {...register('phone', { required: 'Requerido' })} placeholder="+56 9 ..." style={inputStyle(errors.phone)} />
              {errors.phone && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Email *</label>
            <input type="email" {...register('email', { required: 'Requerido' })} style={inputStyle(errors.email)} />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.email.message}</p>}
          </div>

          <h3 style={{ margin: '0.5rem 0 0', fontSize: 16, fontWeight: 600 }}>Tu vehículo</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Marca</label>
              <input {...register('vehicle_make')} placeholder="Toyota, Ford..." style={inputStyle(false)} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Modelo</label>
              <input {...register('vehicle_model')} placeholder="Hilux, Ranger..." style={inputStyle(false)} />
            </div>
            <div>
              { }
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Año</label>
              <input
                type="number"
                {...register('vehicle_year', {
                  min: { value: 1980, message: 'Año mínimo 1980' },
                  max: { value: new Date().getFullYear() + 1, message: `Año máximo ${new Date().getFullYear() + 1}` },
                })}
                placeholder="2022"
                style={inputStyle(errors.vehicle_year)}
              />
              {errors.vehicle_year && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 2 }}>{errors.vehicle_year.message}</p>}
            </div>
          </div>
          <div style={{ background: wantsInstall ? '#fff7ed' : '#f8f8f6', border: `1px solid ${wantsInstall ? '#fed7aa' : '#eee'}`, borderRadius: 8, padding: '1rem', transition: 'all 0.2s' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={wantsInstall} onChange={(e) => setWantsInstall(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#f97316', cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={16} color={wantsInstall ? '#f97316' : '#888'} />
                <span style={{ fontWeight: 600, fontSize: 14, color: wantsInstall ? '#c2410c' : '#333' }}>
                  Quiero cotizar con instalación incluida
                </span>
              </div>
            </label>
            <p style={{ margin: '6px 0 0 26px', fontSize: 12, color: '#888' }}>
              Coordinamos la instalación con un técnico especializado. Se agrega al presupuesto.
            </p>
            {wantsInstall && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Dirección de instalación</label>
                  <input {...register('install_address')} placeholder="Ej: Av. Principal 123, Santiago" style={inputStyle(false)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Fecha preferida</label>
                  <input type="date" {...register('install_date')}
                    min={new Date().toISOString().split('T')[0]} style={inputStyle(false)} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <textarea {...register('notes')} rows={3} placeholder="Cuéntanos el uso de tu vehículo, dudas, etc."
              style={{ ...inputStyle(false), resize: 'vertical' }} />
          </div>

          <button type="submit" disabled={submit.isPending} style={{
            background: submit.isPending ? '#fdba74' : '#f97316',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '0.875rem', fontSize: 16, fontWeight: 600,
            cursor: submit.isPending ? 'not-allowed' : 'pointer',
          }}>
            {submit.isPending ? 'Enviando...' : 'Enviar cotización'}
          </button>
        </form>
        <div style={{ background: '#f8f8f6', borderRadius: 10, padding: '1.5rem', position: 'sticky', top: 80 }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: 16, fontWeight: 600 }}>
            Tu cotización ({count} {count === 1 ? 'producto' : 'productos'})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {items.map((item) => {
              const isUnavailable = unavailableProducts.some(
                (name) => name.toLowerCase() === item.name.toLowerCase()
              )
              return (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  opacity: isUnavailable ? 0.6 : 1,
                  background: isUnavailable ? '#fef2f2' : 'transparent',
                  borderRadius: isUnavailable ? 6 : 0,
                  padding: isUnavailable ? '4px 6px' : 0,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isUnavailable ? '#ef4444' : 'inherit' }}>
                      {item.name}
                      {isUnavailable && ' ⚠️'}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: isUnavailable ? '#ef4444' : '#888' }}>
                      {isUnavailable ? 'No disponible' : `${formatCLP(item.price)} c/u`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                    {!isUnavailable && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}>-</button>
                        <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}>+</button>
                      </div>
                    )}
                    <button onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {wantsInstall && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '0.6rem 0.75rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wrench size={13} color="#f97316" />
              <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 500 }}>Instalación incluida en cotización</span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
            <span>Total estimado</span>
            <span>{formatCLP(total)}</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#888' }}>
            * Los precios se confirman al enviar. El total final puede variar si algún precio fue actualizado{wantsInstall ? ' o por el costo de instalación' : ''}.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr 100px"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}