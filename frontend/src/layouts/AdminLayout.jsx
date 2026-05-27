import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, ShoppingBag, LogOut, Layers, Menu, X } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  const currentLabel = navItems.find((n) => pathname === n.to || (n.to !== '/admin' && pathname.startsWith(n.to)))?.label || 'Panel'

  const SidebarContent = () => (
    <>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
            Torque <span style={{ color: '#f97316' }}>Admin</span>
          </div>
          <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{user?.name}</div>
        </div>
        <button onClick={() => setMenuOpen(false)} className="admin-menu-close"
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}>
          <X size={20} />
        </button>
      </div>
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== '/admin' && pathname.startsWith(to))
          return (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.75rem 1.25rem',
              color: active ? '#f97316' : '#999',
              background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
              borderLeft: active ? '2px solid #f97316' : '2px solid transparent',
              textDecoration: 'none', fontSize: 14, fontWeight: active ? 500 : 400,
            }}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '1rem', borderTop: '1px solid #222' }}>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '0.6rem 0.5rem',
          background: 'none', border: 'none', color: '#666',
          cursor: 'pointer', fontSize: 14, borderRadius: 6,
        }}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f6' }}>

      {/* Sidebar desktop */}
      <aside className="admin-sidebar-desktop" style={{
        width: 220, background: '#111', display: 'flex',
        flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <SidebarContent />
      </aside>

      {/* Overlay móvil */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 40, display: 'none',
        }} className="admin-overlay" />
      )}

      {/* Sidebar móvil (drawer) */}
      <aside className="admin-sidebar-mobile" style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: 260, background: '#111', display: 'flex',
        flexDirection: 'column', zIndex: 50,
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        <SidebarContent />
      </aside>

      {/* Contenido */}
      <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <header style={{
          background: '#fff', borderBottom: '1px solid #eee',
          padding: '0.875rem 1.5rem', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMenuOpen(true)} className="admin-hamburger"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, display: 'none' }}>
              <Menu size={22} />
            </button>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#111' }}>{currentLabel}</h1>
          </div>
          <Link to="/" target="_blank" style={{ color: '#f97316', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Ver sitio →
          </Link>
        </header>

        <main style={{ padding: '1.5rem' }} className="admin-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-mobile  { display: flex !important; }
          .admin-overlay         { display: block !important; }
          .admin-hamburger       { display: flex !important; }
          .admin-menu-close      { display: flex !important; }
          .admin-main            { padding: 1rem !important; }
        }
        @media (min-width: 768px) {
          .admin-sidebar-mobile  { display: none !important; }
          .admin-overlay         { display: none !important; }
          .admin-hamburger       { display: none !important; }
          .admin-menu-close      { display: none !important; }
        }
      `}</style>
    </div>
  )
}