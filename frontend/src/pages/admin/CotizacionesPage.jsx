import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, CheckCircle, XCircle, ArrowRight, Plus, Trash2, X, Search, Wrench, PackagePlus } from 'lucide-react'
import { quoteService, orderService } from '../../services/index'
import { productService } from '../../services/productService'
import { formatCLP, formatDateTime, getStatusLabel } from '../../utils/format'
import Pagination from '../../components/Pagination'
import api from '../../services/api'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  const { label, color } = getStatusLabel(status)
  const colors = { amber: '#f97316', blue: '#3b82f6', green: '#22c55e', red: '#ef4444', gray: '#888' }
  const c = colors[color] || '#888'
  return (
    <span style={{ background: c + '15', color: c, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
      {label}
    </span>
  )
}

const inp = (hasError = false) => ({
  width: '100%', padding: '0.6rem 0.75rem',
  border: `1px solid ${hasError ? '#ef4444' : '#ddd'}`,
  borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
})

function QuoteDetailModal({ quote, onClose }) {
  const qc = useQueryClient()
  const [installCost, setInstallCost] = useState(quote.installation_cost || 0)

  const updateInstallCost = useMutation({
    mutationFn: () => quoteService.updateInstallationCost(quote.id, installCost),
    onSuccess: (updatedQuote) => {
      toast.success('Costo de instalación actualizado')
      // Actualizar el objeto quote en memoria para reflejar el nuevo total inmediatamente
      quote.installation_cost = updatedQuote.installation_cost
      quote.total             = updatedQuote.total
      qc.invalidateQueries({ queryKey: ['quotes'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al actualizar'),
  })

  const updateStatus = useMutation({
    mutationFn: (status) => quoteService.updateStatus(quote.id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotes'] }); onClose() },
    onError: (e) => toast.error(e.response?.data?.error || 'Error'),
  })

  const approveAndConvert = useMutation({
    mutationFn: () => quoteService.approveAndConvert(quote.id),
    onSuccess: () => {
      toast.success('Cotización aprobada y pedido creado')
      qc.invalidateQueries({ queryKey: ['quotes'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al aprobar'),
  })

  const wantsInstall = quote.wants_installation

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Cotización #{quote.id}</h2>
            <StatusBadge status={quote.status} />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
        </div>

        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 15 }}>{quote.customer_name}</p>
          <p style={{ margin: '0 0 2px', fontSize: 13, color: '#666' }}>{quote.customer_email}</p>
          {quote.customer_phone && <p style={{ margin: '0 0 2px', fontSize: 13, color: '#666' }}>📞 {quote.customer_phone}</p>}
          {quote.vehicle_make && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #eee' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#f97316', fontWeight: 500 }}>
                🚗 {quote.vehicle_make} {quote.vehicle_model} {quote.vehicle_year || ''}
              </p>
            </div>
          )}
        </div>

        {wantsInstall && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Wrench size={15} color="#f97316" />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#c2410c' }}>El cliente solicita instalación</span>
            </div>

          </div>
        )}

        {quote.notes && (
          <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Observaciones</p>
            <p style={{ margin: 0, fontSize: 13, color: '#555', whiteSpace: 'pre-line' }}>{quote.notes}</p>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #eee' }}>
              {['Producto', 'Cant.', 'Precio unit.', 'Subtotal'].map((h) => (
                <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(quote.items || []).map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '0.75rem', fontSize: 14 }}>{item.product_name}</td>
                <td style={{ padding: '0.75rem', fontSize: 14 }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem', fontSize: 14 }}>{formatCLP(item.unit_price)}</td>
                <td style={{ padding: '0.75rem', fontSize: 14, fontWeight: 600 }}>{formatCLP(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Subtotal productos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: 14, color: '#666' }}>Subtotal productos</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{formatCLP(quote.total - (quote.installation_cost || 0))}</span>
        </div>

        {/* Costo instalación — editable solo si la cotización está pendiente */}
        {quote.status === 'pending' && (
          <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.625rem' }}>
              <Wrench size={14} color="#f97316" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Costo de instalación</span>
              {quote.wants_installation && (
                <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: 11, fontWeight: 500, padding: '1px 7px', borderRadius: 20, border: '1px solid #fed7aa' }}>
                  Cliente lo solicitó
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#888' }}>$</span>
                <input
                  type="number" min="0"
                  value={installCost}
                  onChange={(e) => setInstallCost(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 1.5rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={() => updateInstallCost.mutate()}
                disabled={installCost === (quote.installation_cost || 0) || updateInstallCost.isPending}
                style={{
                  padding: '0.5rem 1rem', border: 'none', borderRadius: 6, whiteSpace: 'nowrap',
                  background: installCost === (quote.installation_cost || 0) ? '#f3f4f6' : '#f97316',
                  color: installCost === (quote.installation_cost || 0) ? '#aaa' : '#fff',
                  fontSize: 13, fontWeight: 500,
                  cursor: installCost === (quote.installation_cost || 0) ? 'not-allowed' : 'pointer',
                }}>
                {updateInstallCost.isPending ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        )}

        {/* Si aprobada, mostrar costo de instalación como solo lectura */}
        {quote.status === 'approved' && (quote.installation_cost || 0) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wrench size={13} color="#f97316" /> Costo de instalación
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{formatCLP(quote.installation_cost)}</span>
          </div>
        )}

        {/* Total final */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, marginBottom: '1.5rem', paddingTop: '0.5rem', borderTop: '2px solid #111' }}>
          <span>Total</span>
          <span>{formatCLP((quote.total - (quote.installation_cost || 0)) + installCost)}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Cerrar
          </button>
          {quote.status === 'pending' && (
            <>
              <button onClick={() => updateStatus.mutate('rejected')} disabled={updateStatus.isPending || approveAndConvert.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', border: 'none', borderRadius: 6, background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                <XCircle size={15} /> Rechazar
              </button>
              <button onClick={() => approveAndConvert.mutate()} disabled={updateStatus.isPending || approveAndConvert.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, background: approveAndConvert.isPending ? '#86efac' : '#16a34a', color: '#fff', fontSize: 14, cursor: approveAndConvert.isPending ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                <CheckCircle size={15} /> {approveAndConvert.isPending ? 'Procesando...' : 'Aprobar y crear pedido'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NewQuoteModal({ onClose }) {
  const qc = useQueryClient()
  const [wantsInstall, setWantsInstall] = useState(false)
  const [cartItems, setCartItems]       = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    vehicle_make: '', vehicle_model: '', vehicle_year: '',
    notes: '',
  })

  const { data: result } = useQuery({
    queryKey: ['products', { limit: 100 }],
    queryFn: () => productService.getAll({ limit: 100 }),
  })
  const products = result?.data ?? []

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  )

  const addProduct = (product) => {
    setCartItems((prev) => {
      const ex = prev.find((i) => i.product.id === product.id)
      if (ex) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) setCartItems((prev) => prev.filter((i) => i.product.id !== id))
    else setCartItems((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: qty } : i))
  }

  const total = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
  const set   = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Requerido'
    if (!form.email.trim()) e.email = 'Requerido'
    if (!form.phone.trim()) e.phone = 'Requerido'
    if (cartItems.length === 0) e.items = 'Agrega al menos un producto'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = useMutation({
    mutationFn: () => {
      const notes = form.notes || ''
      return quoteService.create({
        customer_name:  form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        vehicle_make:   form.vehicle_make || undefined,
        vehicle_model:  form.vehicle_model || undefined,
        vehicle_year:   form.vehicle_year ? parseInt(form.vehicle_year) : undefined,
        wants_installation: wantsInstall,
        notes:              notes.trim() || undefined,
        items: cartItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      })
    },
    onSuccess: () => {
      toast.success('Cotización creada')
      qc.invalidateQueries({ queryKey: ['quotes'] })
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al crear cotización'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) submit.mutate()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 880, maxHeight: '94vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1px solid #eee', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PackagePlus size={20} color="#f97316" />
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Nueva cotización manual</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>

          <div style={{ padding: '1.5rem 1.75rem', borderRight: '1px solid #eee', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Datos del cliente</p>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input value={form.name} onChange={set('name')} style={inp(errors.name)} />
              {errors.name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.name}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Teléfono *</label>
                <input value={form.phone} onChange={set('phone')} placeholder="+56 9 ..." style={inp(errors.phone)} />
                {errors.phone && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.phone}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Email *</label>
                <input type="email" value={form.email} onChange={set('email')} style={inp(errors.email)} />
                {errors.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.email}</p>}
              </div>
            </div>

            <p style={{ margin: '0.25rem 0 0', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Vehículo</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Marca</label>
                <input value={form.vehicle_make} onChange={set('vehicle_make')} placeholder="Toyota..." style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Modelo</label>
                <input value={form.vehicle_model} onChange={set('vehicle_model')} placeholder="Hilux..." style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Año</label>
                <input type="number" value={form.vehicle_year} onChange={set('vehicle_year')} placeholder="2022" style={inp()} />
              </div>
            </div>

            <div style={{ background: wantsInstall ? '#fff7ed' : '#f8f8f6', border: `1px solid ${wantsInstall ? '#fed7aa' : '#eee'}`, borderRadius: 8, padding: '0.875rem', transition: 'all 0.2s' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={wantsInstall} onChange={(e) => setWantsInstall(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#f97316' }} />
                <Wrench size={14} color={wantsInstall ? '#f97316' : '#888'} />
                <span style={{ fontWeight: 600, fontSize: 13, color: wantsInstall ? '#c2410c' : '#333' }}>
                  Cotizar instalación  
                </span>
              </label>

            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Notas adicionales del cliente..."
                style={{ ...inp(), resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Productos</p>

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar por nombre o SKU..."
                style={{ ...inp(), paddingLeft: '2rem' }} />
            </div>

            <div style={{ border: '1px solid #eee', borderRadius: 8, maxHeight: 210, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <p style={{ padding: '1rem', color: '#888', fontSize: 13, textAlign: 'center' }}>No hay productos</p>
              ) : filtered.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.875rem', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{formatCLP(p.price)}{p.sku ? ` · ${p.sku}` : ''}</p>
                  </div>
                  <button type="button" onClick={() => addProduct(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', marginLeft: 8,
                    background: '#f97316', color: '#fff', border: 'none', borderRadius: 6,
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
                  }}>
                    <Plus size={12} /> Agregar
                  </button>
                </div>
              ))}
            </div>

            <div>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#333' }}>
                Seleccionados {cartItems.length > 0 && `(${cartItems.length})`}
              </p>
              {errors.items && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 6 }}>{errors.items}</p>}

              {cartItems.length === 0 ? (
                <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '1.25rem', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                  Busca y agrega productos desde arriba
                </div>
              ) : (
                <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 0.875rem', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{formatCLP(product.price)} c/u</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <button type="button" onClick={() => updateQty(product.id, quantity - 1)}
                          style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{quantity}</span>
                        <button type="button" onClick={() => updateQty(product.id, quantity + 1)}
                          style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 72, textAlign: 'right', flexShrink: 0 }}>
                        {formatCLP(product.price * quantity)}
                      </span>
                      <button type="button" onClick={() => updateQty(product.id, 0)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div style={{ padding: '0.75rem 0.875rem', background: '#f8f8f6', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                    <span>Total estimado</span>
                    <span>{formatCLP(total)}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem' }}>
              <button type="button" onClick={onClose}
                style={{ padding: '0.65rem 1.25rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" disabled={submit.isPending}
                style={{ padding: '0.65rem 1.5rem', border: 'none', borderRadius: 6, background: submit.isPending ? '#fdba74' : '#f97316', color: '#fff', fontSize: 14, fontWeight: 600, cursor: submit.isPending ? 'not-allowed' : 'pointer' }}>
                {submit.isPending ? 'Guardando...' : 'Crear cotización'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CotizacionesPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]                 = useState(1)
  const [selected, setSelected]         = useState(null)
  const [newModal, setNewModal]         = useState(false)
  const qc = useQueryClient()

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  const { data: result, isLoading } = useQuery({
    queryKey: ['quotes', statusFilter, page],
    queryFn: () => quoteService.getAll({
      ...(statusFilter ? { status: statusFilter } : {}),
      page,
      limit: 20,
    }),
  })

  const quotes     = result?.data       ?? []
  const pagination = result?.pagination ?? null

  const deleteQuote = useMutation({
    mutationFn: (id) => api.delete(`/quotes/${id}`),
    onSuccess: () => { toast.success('Cotización eliminada'); qc.invalidateQueries({ queryKey: ['quotes'] }) },
    onError: () => toast.error('No se pudo eliminar la cotización'),
  })

  const handleDelete = (q) => {
    if (!confirm(`¿Eliminar la cotización #${q.id} de ${q.customer_name}? Esta acción no se puede deshacer.`)) return
    deleteQuote.mutate(q.id)
  }

  return (
    <div>
      <div className="cot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Cotizaciones</h2>
        <div className="cot-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}
            style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none' }}>
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
          <button onClick={() => setNewModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f97316', color: '#fff', border: 'none',
            borderRadius: 8, padding: '0.6rem 1.25rem', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            <Plus size={16} /> Nueva cotización
          </button>
        </div>
      </div>

      {/* Tabla desktop */}
      <div className="cot-table-wrap" style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #eee' }}>
              {['#', 'Cliente', 'Vehículo', 'Instalación', 'Total', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#555' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Cargando...</td></tr>
            ) : quotes.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No hay cotizaciones</td></tr>
            ) : quotes.map((q) => {
              const wantsInstall = q.wants_installation
              return (
                <tr key={q.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#888' }}>#{q.id}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{q.customer_name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{q.customer_email}</p>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#666' }}>
                    {q.vehicle_make ? `${q.vehicle_make} ${q.vehicle_model} ${q.vehicle_year || ''}` : '-'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {wantsInstall ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                        <Wrench size={11} /> Sí
                      </span>
                    ) : (
                      <span style={{ color: '#aaa', fontSize: 13 }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: 14, fontWeight: 600 }}>{formatCLP(q.total)}</td>
                  <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={q.status} /></td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#888' }}>{formatDateTime(q.created_at)}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setSelected(q)} title="Ver detalle"
                        style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#555' }}>
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleDelete(q)} title="Eliminar"
                        style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Cards móvil */}
      <div className="cot-cards-wrap" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Cargando...</p>
        ) : quotes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No hay cotizaciones</p>
        ) : quotes.map((q) => (
          <div key={q.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{q.customer_name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{q.customer_email}</p>
                {q.vehicle_make && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#f97316' }}>
                    {q.vehicle_make} {q.vehicle_model} {q.vehicle_year || ''}
                  </p>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#aaa' }}>#{q.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <StatusBadge status={q.status} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {q.wants_installation && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#fff7ed', color: '#c2410c', padding: '1px 6px', borderRadius: 20, fontSize: 11 }}>
                      <Wrench size={10} /> Instalación
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: '#aaa' }}>{formatDateTime(q.created_at)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{formatCLP(q.total)}</span>
                <button onClick={() => setSelected(q)}
                  style={{ background: '#f97316', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 500 }}>
                  Ver
                </button>
                <button onClick={() => handleDelete(q)}
                  style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <style>{`
        @media (max-width: 767px) {
          .cot-table-wrap  { display: none !important; }
          .cot-cards-wrap  { display: flex !important; }
          .cot-actions     { width: 100%; justify-content: space-between; }
        }
        /* Modales pantalla completa en móvil */
        @media (max-width: 600px) {
          [style*="maxWidth: 620"], [style*="maxWidth: 880"], [style*="maxWidth: 560"] {
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 12px 12px 0 0 !important;
            max-height: 95vh !important;
          }
        }
      `}</style>

      {selected && <QuoteDetailModal quote={selected} onClose={() => setSelected(null)} />}
      {newModal  && <NewQuoteModal   onClose={() => setNewModal(false)} />}
    </div>
  )
}