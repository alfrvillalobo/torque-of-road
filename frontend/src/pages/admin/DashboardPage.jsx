import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Package, FileText, ShoppingBag, TrendingUp,
  CheckCircle, XCircle, ArrowRight, Wrench,
  Clock, AlertCircle, X,
} from 'lucide-react'
import { orderService, quoteService } from '../../services/index'
import { productService } from '../../services/productService'
import { formatCLP, formatDateTime, getStatusLabel } from '../../utils/format'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  const { label, color } = getStatusLabel(status)
  const colors = { amber: '#f97316', blue: '#3b82f6', green: '#22c55e', red: '#ef4444', purple: '#a855f7', teal: '#14b8a6', gray: '#888' }
  const c = colors[color] || '#888'
  return <span style={{ background: c + '18', color: c, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{label}</span>
}

function getCurrentMonth() {
  const now = new Date()
  const year  = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const content = (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '1.25rem 1.5rem',
      border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 14,
      transition: 'box-shadow 0.15s', cursor: to ? 'pointer' : 'default',
    }}
      onMouseEnter={(e) => to && (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)')}
      onMouseLeave={(e) => to && (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ background: color + '15', borderRadius: 9, padding: 11, flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#111' }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>{sub}</p>}
      </div>
    </div>
  )
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content
}

function QuickQuoteModal({ quote, onClose }) {
  const qc = useQueryClient()
  const currentMonth = getCurrentMonth()

  const reject = useMutation({
    mutationFn: () => quoteService.updateStatus(quote.id, 'rejected'),
    onSuccess: () => {
      toast.success('Cotización rechazada')
      qc.invalidateQueries({ queryKey: ['quotes-month', currentMonth] })
      qc.invalidateQueries({ queryKey: ['quotes-pending'] })
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al rechazar'),
  })

  const approveAndConvert = useMutation({
    mutationFn: () => quoteService.approveAndConvert(quote.id),
    onSuccess: () => {
      toast.success('✅ Cotización aprobada y pedido creado')
      qc.invalidateQueries({ queryKey: ['quotes-month', currentMonth] })
      qc.invalidateQueries({ queryKey: ['quotes-pending'] })
      qc.invalidateQueries({ queryKey: ['orders-month', currentMonth] })
      qc.invalidateQueries({ queryKey: ['orders-active'] })
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al procesar'),
  })

  const [installCost, setInstallCost] = useState(quote.installation_cost || 0)

  const updateInstallCost = useMutation({
    mutationFn: () => quoteService.updateInstallationCost(quote.id, installCost),
    onSuccess: (updatedQuote) => {
      toast.success('Costo de instalación actualizado')
      quote.installation_cost = updatedQuote.installation_cost
      quote.total             = updatedQuote.total
      qc.invalidateQueries({ queryKey: ['quotes-pending'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al actualizar'),
  })

  const isPending    = reject.isPending || approveAndConvert.isPending || updateInstallCost.isPending
  const wantsInstall = quote.wants_installation

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="dash-modal-box" style={{ background: '#fff', borderRadius: 12, padding: '1.75rem', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Cotización #{quote.id}</h3>
          <button onClick={onClose} disabled={isPending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
        </div>

        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '0.875rem', marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14 }}>{quote.customer_name}</p>
          <p style={{ margin: '0 0 2px', fontSize: 13, color: '#666' }}>{quote.customer_email}</p>
          {quote.customer_phone && <p style={{ margin: 0, fontSize: 13, color: '#666' }}>📞 {quote.customer_phone}</p>}
          {quote.vehicle_make && (
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#f97316', fontWeight: 500 }}>
              🚗 {quote.vehicle_make} {quote.vehicle_model} {quote.vehicle_year || ''}
            </p>
          )}
        </div>

        {wantsInstall && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wrench size={13} color="#f97316" />
            <span style={{ fontWeight: 600, fontSize: 13, color: '#c2410c' }}>El cliente quiere cotizar instalación</span>
          </div>
        )}

        {quote.notes && (
          <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Observaciones</p>
            <p style={{ margin: 0, fontSize: 13, color: '#555', whiteSpace: 'pre-line' }}>{quote.notes}</p>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Producto', 'Cant.', 'Subtotal'].map((h) => (
                <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: 11, color: '#888', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(quote.items || []).map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '0.5rem', fontSize: 13 }}>{item.product_name}</td>
                <td style={{ padding: '0.5rem', fontSize: 13 }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem', fontSize: 13, fontWeight: 600 }}>{formatCLP(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Campo editable costo instalación */}
        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '0.875rem 1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.625rem' }}>
            <Wrench size={14} color="#f97316" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Costo de instalación</span>
            {wantsInstall && (
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

        {/* Desglose totales */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 13, color: '#666' }}>Subtotal productos</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCLP(quote.total - (quote.installation_cost || 0))}</span>
          </div>
          {(quote.installation_cost || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Wrench size={12} color="#f97316" /> Instalación
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCLP(quote.installation_cost)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #111', fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span>{formatCLP(quote.total)}</span>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13, color: '#15803d' }}>
          <strong>Al aprobar</strong>, la cotización se marcará como aprobada y el pedido se creará automáticamente. Si algo falla, ningún cambio queda guardado.
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={isPending}
            style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Cerrar
          </button>
          <button onClick={() => reject.mutate()} disabled={isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.6rem 1rem', border: 'none', borderRadius: 6, background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: isPending ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
            <XCircle size={14} /> Rechazar
          </button>
          <button onClick={() => approveAndConvert.mutate()} disabled={isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, background: isPending ? '#86efac' : '#16a34a', color: '#fff', fontSize: 14, cursor: isPending ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            <CheckCircle size={14} />
            {approveAndConvert.isPending ? 'Procesando...' : 'Aprobar y crear pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickOrderModal({ order, onClose }) {
  const qc = useQueryClient()
  const currentMonth = getCurrentMonth()
  const STATUSES = ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled']
  const [status, setStatus] = useState(order.status)

  const updateStatus = useMutation({
    mutationFn: () => orderService.updateStatus(order.id, status),
    onSuccess: () => {
      toast.success('Estado actualizado')
      qc.invalidateQueries({ queryKey: ['orders-month', currentMonth] })
      qc.invalidateQueries({ queryKey: ['orders-active'] })
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error'),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '1.75rem', width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Pedido #{order.id}</h3>
            <StatusBadge status={order.status} />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={18} /></button>
        </div>

        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '0.875rem', marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14 }}>{order.customer_name}</p>
          <p style={{ margin: '0 0 2px', fontSize: 13, color: '#666' }}>{order.customer_email}</p>
          {order.customer_phone && (
            <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customer_name)},%20te%20contactamos%20desde%20Torque%20Off%20Road%20sobre%20tu%20pedido%20%23${order.id}.`}
              target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, background: '#25d366', color: '#fff', textDecoration: 'none', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
              WhatsApp al cliente
            </a>
          )}
          {order.shipping_address && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>📍 {order.shipping_address}</p>}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Producto', 'Cant.', 'Subtotal'].map((h) => (
                <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: 11, color: '#888', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '0.5rem', fontSize: 13 }}>{item.product_name}</td>
                <td style={{ padding: '0.5rem', fontSize: 13 }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem', fontSize: 13, fontWeight: 600 }}>{formatCLP(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 13, color: '#666' }}>Subtotal productos</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCLP(order.subtotal)}</span>
          </div>
          {(order.installation_cost || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔧 Instalación
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCLP(order.installation_cost)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #111', fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span>{formatCLP(order.total)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cerrar</button>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: '#fff', outline: 'none' }}>
            {STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s).label}</option>)}
          </select>
          <button onClick={() => updateStatus.mutate()} disabled={status === order.status || updateStatus.isPending}
            style={{ padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: status === order.status ? 0.5 : 1 }}>
            {updateStatus.isPending ? 'Guardando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [quickQuote, setQuickQuote] = useState(null)
  const [quickOrder, setQuickOrder] = useState(null)

  const currentMonth = getCurrentMonth()
  const now          = new Date()
  const monthName    = now.toLocaleString('es-CL', { month: 'long' })
  const { data: productsResult }        = useQuery({ queryKey: ['products', { limit: 100 }],          queryFn: () => productService.getAll({ limit: 100 }) })
  const { data: quotesMonthResult }     = useQuery({ queryKey: ['quotes-month', currentMonth],         queryFn: () => quoteService.getAll({ month: currentMonth, limit: 100 }) })
  const { data: ordersMonthResult }     = useQuery({ queryKey: ['orders-month', currentMonth],         queryFn: () => orderService.getAll({ month: currentMonth, limit: 100 }) })
  const { data: pendingQuotesResult }   = useQuery({ queryKey: ['quotes-pending'],                     queryFn: () => quoteService.getAll({ status: 'pending', limit: 100 }) })
  const { data: activeOrdersResult }    = useQuery({ queryKey: ['orders-active'],                      queryFn: () => orderService.getAll({ limit: 100 }) })
  const products       = productsResult?.data      ?? []
  const quotesThisMonth = quotesMonthResult?.data   ?? []
  const ordersThisMonth = ordersMonthResult?.data   ?? []
  const pendingQuotes   = pendingQuotesResult?.data ?? []
  const activeOrders    = activeOrdersResult?.data  ?? []

  const activeFiltered = activeOrders.filter((o) => !['delivered', 'cancelled'].includes(o.status))

  const revenueThisMonth  = ordersThisMonth
    .filter((o) => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total, 0)

  const approvedThisMonth = quotesThisMonth.filter((q) => q.status === 'approved').length
  const conversionRate    = quotesThisMonth.length > 0
    ? Math.round((approvedThisMonth / quotesThisMonth.length) * 100)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      <div>
        <h2 style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 700 }}>Buenos días, Cristóbal 👋</h2>
        <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Resumen de {monthName} {now.getFullYear()}</p>
      </div>

      {pendingQuotes.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} color="#f97316" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: '#92400e' }}>
            Tienes <strong>{pendingQuotes.length} cotización{pendingQuotes.length > 1 ? 'es' : ''} pendiente{pendingQuotes.length > 1 ? 's' : ''}</strong> esperando revisión.
          </span>
          <Link to="/admin/cotizaciones" style={{ marginLeft: 'auto', color: '#f97316', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Ver todas →
          </Link>
        </div>
      )}

      <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        <StatCard icon={FileText}    label="Cotizaciones este mes" value={quotesThisMonth.length}      sub={`${pendingQuotes.length} pendientes`}    color="#3b82f6" to="/admin/cotizaciones" />
        <StatCard icon={ShoppingBag} label="Pedidos este mes"      value={ordersThisMonth.length}      sub={`${activeFiltered.length} en proceso`}   color="#a855f7" to="/admin/pedidos" />
        <StatCard icon={TrendingUp}  label="Ingresos este mes"     value={formatCLP(revenueThisMonth)} sub="pedidos entregados"                       color="#22c55e" />
        <StatCard icon={Package}     label="Tasa de conversión"    value={`${conversionRate}%`}        sub="cotización → aprobada"                    color="#f97316" />
      </div>

      <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Cotizaciones pendientes</h3>
            <Link to="/admin/cotizaciones" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>Ver todas →</Link>
          </div>
          {pendingQuotes.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <CheckCircle size={28} color="#22c55e" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>Sin cotizaciones pendientes 🎉</p>
            </div>
          ) : pendingQuotes.slice(0, 5).map((q) => {
            const wantsInstall = q.wants_installation
            return (
              <div key={q.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.customer_name}</p>
                    {wantsInstall && <Wrench size={11} color="#f97316" title="Solicita instalación" />}
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>
                    {q.vehicle_make ? `${q.vehicle_make} ${q.vehicle_model}` : 'Sin vehículo'} · {formatCLP(q.total)}
                  </p>
                </div>
                <button onClick={() => setQuickQuote(q)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                  <ArrowRight size={12} /> Revisar
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pedidos en proceso</h3>
            <Link to="/admin/pedidos" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>Ver todos →</Link>
          </div>
          {activeFiltered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Clock size={28} color="#aaa" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>No hay pedidos activos</p>
            </div>
          ) : activeFiltered.slice(0, 5).map((o) => (
            <div key={o.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer_name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StatusBadge status={o.status} />
                  <span style={{ fontSize: 11, color: '#aaa' }}>{formatCLP(o.total)}</span>
                </div>
              </div>
              <button onClick={() => setQuickOrder(o)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                <ArrowRight size={12} /> Gestionar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Cotizaciones de {monthName}</h3>
          </div>
          {quotesThisMonth.length === 0 ? (
            <p style={{ padding: '1.5rem', color: '#888', fontSize: 13 }}>Sin cotizaciones este mes</p>
          ) : [...quotesThisMonth].slice(0, 5).map((q) => (
            <div key={q.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500 }}>{q.customer_name}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{formatDateTime(q.created_at)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCLP(q.total)}</span>
                <StatusBadge status={q.status} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pedidos de {monthName}</h3>
          </div>
          {ordersThisMonth.length === 0 ? (
            <p style={{ padding: '1.5rem', color: '#888', fontSize: 13 }}>Sin pedidos este mes</p>
          ) : [...ordersThisMonth].slice(0, 5).map((o) => (
            <div key={o.id} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500 }}>{o.customer_name}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{formatDateTime(o.created_at)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCLP(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {quickQuote && <QuickQuoteModal quote={quickQuote} onClose={() => setQuickQuote(null)} />}
      {quickOrder && <QuickOrderModal order={quickOrder} onClose={() => setQuickOrder(null)} />}

      <style>{`
        @media (max-width: 767px) {
          .dash-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .dash-two-col    { grid-template-columns: 1fr !important; }
          .dash-modal-box  { max-height: 95vh !important; border-radius: 12px 12px 0 0 !important; margin-top: auto; padding: 1.25rem !important; }
        }
        @media (max-width: 480px) {
          .dash-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}