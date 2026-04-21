import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { orderService } from '../../services/index'
import { formatCLP, formatDateTime, getStatusLabel } from '../../utils/format'
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

        <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, marginBottom: '1.5rem' }}>
          Total: {formatCLP(order.total)}
        </div>

        {/* Cambiar estado */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Cerrar
          </button>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: '#fff' }}>
            {STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s).label}</option>)}
          </select>
          <button onClick={() => updateStatus.mutate()} disabled={status === order.status}
            style={{ padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PedidosPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => orderService.getAll(statusFilter ? { status: statusFilter } : {}),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Pedidos</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' }}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s).label}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
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
      </div>

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
