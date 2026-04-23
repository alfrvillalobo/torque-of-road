import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, ShoppingBag, Truck, LogOut, Layers } from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import { useLogout } from '../hooks/useAuth'

const navItems = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/productos',    icon: Package,         label: 'Productos' },
  { to: '/admin/categorias',   icon: Layers,          label: 'Categorías' },
  { to: '/admin/cotizaciones', icon: FileText,        label: 'Cotizaciones' },
  { to: '/admin/pedidos',      icon: ShoppingBag,     label: 'Pedidos' },
]

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const { pathname } = useLocation()
  const logout = useLogout()

  // Redirigir si no está autenticado o no es admin
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f6' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#111', display: 'flex',
        flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
            Torque <span style={{ color: '#f97316' }}>Admin</span>
          </div>
          <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
            {user?.name}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || (to !== '/admin' && pathname.startsWith(to))
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.65rem 1.25rem',
                color: active ? '#f97316' : '#999',
                background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
                borderLeft: active ? '2px solid #f97316' : '2px solid transparent',
                textDecoration: 'none', fontSize: 14, fontWeight: active ? 500 : 400,
                transition: 'all 0.15s',
              }}>
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid #222' }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '0.6rem 0.5rem',
            background: 'none', border: 'none', color: '#666',
            cursor: 'pointer', fontSize: 14, borderRadius: 6,
          }}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #eee',
          padding: '1rem 2rem', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111' }}>
            {navItems.find((n) => pathname === n.to || (n.to !== '/admin' && pathname.startsWith(n.to)))?.label || 'Panel de administración'}
          </h1>
          <Link to="/" target="_blank" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none' }}>
            Ver sitio →
          </Link>
        </header>

        <main style={{ padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
