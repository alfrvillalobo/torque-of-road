import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { orderService } from '../../services/index'
import { formatCLP, formatDateTime, getStatusLabel } from '../../utils/format'
import Pagination from '../../components/Pagination'
import toast from 'react-hot-toast'

const STATUSES = ['pending','confirmed','in_progress','shipped','delivered','cancelled']

function StatusBadge({ status }) {
  const { label, color } = getStatusLabel(status)
  const colors = { amber: '#f97316', blue: '#3b82f6', green: '#22c55e', red: '#ef4444', purple: '#a855f7', teal: '#14b8a6', gray: '#888' }
  const c = colors[color] || '#888'
  return <span style={{ background: c + '20', color: c, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{label}</span>
}

function OrderDetailModal({ order, onClose }) {
  const qc = useQueryClient()
  const [status, setStatus] = useState(order.status)
  const isFinal = ['delivered', 'cancelled'].includes(order.status)

  const updateStatus = useMutation({
    mutationFn: () => orderService.updateStatus(order.id, status),
    onSuccess: () => { toast.success('Estado actualizado'); qc.invalidateQueries({ queryKey: ['orders'] }); onClose() },
    onError: (e) => toast.error(e.response?.data?.error || 'Error'),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Pedido #{order.id}</h2>
          <StatusBadge status={order.status} />
        </div>

        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{order.customer_name}</p>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>{order.customer_email}</p>
          {order.customer_phone && <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>{order.customer_phone}</p>}
          {order.shipping_address && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>{order.shipping_address}</p>}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Producto', 'Cant.', 'Precio', 'Subtotal'].map((h) => (
                <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '0.625rem 0.5rem', fontSize: 14 }}>{item.product_name}</td>
                <td style={{ padding: '0.625rem 0.5rem', fontSize: 14 }}>{item.quantity}</td>
                <td style={{ padding: '0.625rem 0.5rem', fontSize: 14 }}>{formatCLP(item.unit_price)}</td>
                <td style={{ padding: '0.625rem 0.5rem', fontSize: 14, fontWeight: 600 }}>{formatCLP(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Desglose subtotal + instalación + total */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 14, color: '#666' }}>Subtotal productos</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{formatCLP(order.subtotal)}</span>
          </div>
          {(order.installation_cost || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔧 Instalación
              </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{formatCLP(order.installation_cost)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid #111', fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span>{formatCLP(order.total)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Cerrar
          </button>
          {!isFinal ? (
            <>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: '#fff' }}>
                {STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s).label}</option>)}
              </select>
              <button onClick={() => updateStatus.mutate()} disabled={status === order.status}
                style={{ padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Actualizar
              </button>
            </>
          ) : (
            <span style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>
              Estado final — no se puede modificar
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PedidosPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]                 = useState(1)
  const [selected, setSelected]         = useState(null)

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  const { data: result, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, page],
    queryFn: () => orderService.getAll({
      ...(statusFilter ? { status: statusFilter } : {}),
      page,
      limit: 20,
    }),
  })

  const orders     = result?.data       ?? []
  const pagination = result?.pagination ?? null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Pedidos</h2>
        <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' }}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s).label}</option>)}
        </select>
      </div>

      {/* Tabla desktop */}
      <div className="pedidos-table-wrap" style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #eee' }}>
              {['#', 'Cliente', 'Total', 'Estado', 'Fecha', 'Ver'].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#555' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Cargando...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No hay pedidos</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#888' }}>#{o.id}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{o.customer_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{o.customer_email}</p>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 14, fontWeight: 600 }}>{formatCLP(o.total)}</td>
                <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#888' }}>{formatDateTime(o.created_at)}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button onClick={() => setSelected(o)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#555' }}>
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Cards móvil */}
      <div className="pedidos-cards-wrap" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Cargando...</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No hay pedidos</p>
        ) : orders.map((o) => (
          <div key={o.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{o.customer_name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{o.customer_email}</p>
              </div>
              <span style={{ fontSize: 12, color: '#aaa' }}>#{o.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <StatusBadge status={o.status} />
                <span style={{ fontSize: 12, color: '#aaa' }}>{formatDateTime(o.created_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{formatCLP(o.total)}</span>
                <button onClick={() => setSelected(o)} style={{ background: '#f97316', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 500 }}>
                  Ver
                </button>
              </div>
            </div>
          </div>
        ))}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <style>{`
        @media (max-width: 767px) {
          .pedidos-table-wrap { display: none !important; }
          .pedidos-cards-wrap { display: flex !important; }
        }
        @media (max-width: 600px) {
          [style*="maxWidth: 560"] {
            max-width: 100% !important;
            border-radius: 12px 12px 0 0 !important;
            max-height: 95vh !important;
          }
        }
      `}</style>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}