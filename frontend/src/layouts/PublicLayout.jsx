import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Truck } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../context/cartStore'

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const count = useCartStore((s) => s.count)
  const { pathname } = useLocation()

  const navLinks = [
    { to: '/',          label: 'Inicio' },
    { to: '/catalogo',  label: 'Catálogo' },
    { to: '/nosotros',  label: 'Nosotros' },
    { to: '/contacto',  label: 'Contacto' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#111', borderBottom: '1px solid #222',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Truck size={24} color="#f97316" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>
              Torque <span style={{ color: '#f97316' }}>Off Road</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav style={{ display: 'flex', gap: '2rem' }} className="desktop-nav">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} style={{
                color: pathname === l.to ? '#f97316' : '#ccc',
                textDecoration: 'none', fontSize: 15, fontWeight: 500,
                transition: 'color 0.15s',
              }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Carrito + menú móvil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/cotizar" style={{ position: 'relative', color: '#ccc', display: 'flex' }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#f97316', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', display: 'none' }}
              className="mobile-menu-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div style={{ background: '#111', borderTop: '1px solid #222', padding: '1rem 1.5rem' }}>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', color: '#ccc', padding: '0.6rem 0', textDecoration: 'none', fontSize: 15 }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Contenido de la página */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: '#111', borderTop: '1px solid #222', padding: '2rem 1.5rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>
              Torque <span style={{ color: '#f97316' }}>Off Road</span>
            </div>
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
              Kits de suspensión y accesorios para camionetas pick-up
            </p>
          </div>
          <div style={{ color: '#888', fontSize: 14 }}>
            <div>La Florida, Santiago</div>
            <div>+56 9 7384 1370</div>
            <div>czenteno3@gmail.com</div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '1.5rem auto 0', borderTop: '1px solid #222', paddingTop: '1rem', color: '#555', fontSize: 13 }}>
          © {new Date().getFullYear()} Torque Off Road. Todos los derechos reservados.
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </div>
  )
}
