import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { quoteService, orderService } from '../../services/index'
import { formatCLP, formatDateTime, getStatusLabel } from '../../utils/format'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  const { label, color } = getStatusLabel(status)
  const colors = { amber: '#f97316', blue: '#3b82f6', green: '#22c55e', red: '#ef4444', gray: '#888' }
  const c = colors[color] || '#888'
  return (
    <span style={{ background: c + '20', color: c, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
      {label}
    </span>
  )
}

function QuoteDetailModal({ quote, onClose }) {
  const qc = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: (status) => quoteService.updateStatus(quote.id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotes'] }); onClose() },
    onError: (e) => toast.error(e.response?.data?.error || 'Error'),
  })

  const convertToOrder = useMutation({
    mutationFn: () => orderService.createFromQuote(quote.id, {
      customer_name:  quote.customer_name,
      customer_email: quote.customer_email,
      customer_phone: quote.customer_phone,
    }),
    onSuccess: () => {
      toast.success('Pedido creado desde cotización')
      qc.invalidateQueries({ queryKey: ['quotes'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al convertir'),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Cotización #{quote.id}</h2>
          <StatusBadge status={quote.status} />
        </div>

        {/* Info cliente */}
        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{quote.customer_name}</p>
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#666' }}>{quote.customer_email}</p>
          {quote.customer_phone && <p style={{ margin: 0, fontSize: 13, color: '#666' }}>{quote.customer_phone}</p>}
          {quote.vehicle_make && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#f97316', fontWeight: 500 }}>
              {quote.vehicle_make} {quote.vehicle_model} {quote.vehicle_year}
            </p>
          )}
        </div>

        {/* Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Producto', 'Cant.', 'Precio unit.', 'Subtotal'].map((h) => (
                <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(quote.items || []).map((item) => (
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
          Total: {formatCLP(quote.total)}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Cerrar
          </button>
          {quote.status === 'pending' && (
            <>
              <button onClick={() => updateStatus.mutate('rejected')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', border: 'none', borderRadius: 6, background: '#fef2f2', color: '#ef4444', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                <XCircle size={15} /> Rechazar
              </button>
              <button onClick={() => updateStatus.mutate('approved')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', border: 'none', borderRadius: 6, background: '#dcfce7', color: '#166534', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                <CheckCircle size={15} /> Aprobar
              </button>
            </>
          )}
          {quote.status === 'approved' && (
            <button onClick={() => convertToOrder.mutate()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, background: '#f97316', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
              <ArrowRight size={15} /> Convertir en pedido
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CotizacionesPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes', statusFilter],
    queryFn: () => quoteService.getAll(statusFilter ? { status: statusFilter } : {}),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Cotizaciones</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' }}>
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #eee' }}>
              {['#', 'Cliente', 'Vehículo', 'Total', 'Estado', 'Fecha', 'Ver'].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#555' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Cargando...</td></tr>
            ) : quotes.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No hay cotizaciones</td></tr>
            ) : quotes.map((q) => (
              <tr key={q.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#888' }}>#{q.id}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{q.customer_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{q.customer_email}</p>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#666' }}>
                  {q.vehicle_make ? `${q.vehicle_make} ${q.vehicle_model} ${q.vehicle_year || ''}` : '-'}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 14, fontWeight: 600 }}>{formatCLP(q.total)}</td>
                <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={q.status} /></td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#888' }}>{formatDateTime(q.created_at)}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button onClick={() => setSelected(q)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#555' }}>
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <QuoteDetailModal quote={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
