import { useQuery } from '@tanstack/react-query'
import { Package, FileText, ShoppingBag, TrendingUp } from 'lucide-react'
import { orderService, quoteService } from '../../services/index'
import { productService } from '../../services/productService'
import { formatCLP, formatDateTime, getStatusLabel } from '../../utils/format'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '1.5rem',
      border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ background: color + '15', borderRadius: 8, padding: 10 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{value}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const { label, color } = getStatusLabel(status)
  const colors = {
    amber: '#f97316', blue: '#3b82f6', green: '#22c55e',
    red: '#ef4444', purple: '#a855f7', teal: '#14b8a6', gray: '#888',
  }
  return (
    <span style={{
      background: (colors[color] || '#888') + '20',
      color: colors[color] || '#888',
      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    }}>
      {label}
    </span>
  )
}

export default function DashboardPage() {
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => productService.getAll() })
  const { data: quotes = [] } = useQuery({ queryKey: ['quotes'], queryFn: () => quoteService.getAll() })
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => orderService.getAll() })

  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total, 0)

  const recentOrders = [...orders].slice(0, 5)
  const pendingQuotes = quotes.filter((q) => q.status === 'pending')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard icon={Package}     label="Productos activos" value={products.length}       color="#f97316" />
        <StatCard icon={FileText}    label="Cotizaciones nuevas" value={pendingQuotes.length} color="#3b82f6" />
        <StatCard icon={ShoppingBag} label="Pedidos totales"   value={orders.length}         color="#a855f7" />
        <StatCard icon={TrendingUp}  label="Ingresos entregados" value={formatCLP(totalRevenue)} color="#22c55e" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Últimos pedidos */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Últimos pedidos</h3>
          </div>
          <div>
            {recentOrders.length === 0 ? (
              <p style={{ padding: '1.5rem', color: '#888', fontSize: 14 }}>No hay pedidos aún</p>
            ) : recentOrders.map((order) => (
              <div key={order.id} style={{
                padding: '0.875rem 1.5rem', borderBottom: '1px solid #f5f5f5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{order.customer_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{formatDateTime(order.created_at)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{formatCLP(order.total)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cotizaciones pendientes */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Cotizaciones pendientes</h3>
          </div>
          <div>
            {pendingQuotes.length === 0 ? (
              <p style={{ padding: '1.5rem', color: '#888', fontSize: 14 }}>No hay cotizaciones pendientes</p>
            ) : pendingQuotes.slice(0, 5).map((q) => (
              <div key={q.id} style={{
                padding: '0.875rem 1.5rem', borderBottom: '1px solid #f5f5f5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{q.customer_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                    {q.vehicle_make} {q.vehicle_model} {q.vehicle_year}
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{formatCLP(q.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
