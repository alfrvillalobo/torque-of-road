import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Truck, Phone, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useCartStore, selectCount } from '../context/cartStore'

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  )
}

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const count    = useCartStore(selectCount)   // selector derivado, reactivo
  const { pathname } = useLocation()

  const navLinks = [
    { to: '/',         label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/nosotros', label: 'Nosotros' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#111', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Truck size={24} color="#f97316" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>
              Torque <span style={{ color: '#f97316' }}>Off Road</span>
            </span>
          </Link>

          <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem' }}>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} style={{
                color: pathname === l.to ? '#f97316' : '#aaa',
                textDecoration: 'none', fontSize: 15, fontWeight: 500,
                borderBottom: pathname === l.to ? '2px solid #f97316' : '2px solid transparent',
                paddingBottom: 2,
              }}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/cotizar" style={{ position: 'relative', color: '#aaa', display: 'flex', alignItems: 'center', padding: 4, textDecoration: 'none' }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#f97316', color: '#fff', borderRadius: '50%',
                  minWidth: 18, height: 18, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, padding: '0 3px',
                  boxShadow: '0 0 0 2px #111',
                  animation: 'popIn 0.2s ease',
                }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn"
              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'none', padding: 4 }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: '#111', borderTop: '1px solid #1f1f1f', padding: '0.5rem 1.5rem 1rem' }}>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', color: pathname === l.to ? '#f97316' : '#aaa', padding: '0.65rem 0', textDecoration: 'none', fontSize: 15, borderBottom: '1px solid #1f1f1f' }}>
                {l.label}
              </Link>
            ))}
            <Link to="/cotizar" onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.75rem', background: '#f97316', color: '#fff', padding: '0.65rem 1rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              <ShoppingCart size={16} /> Ver cotización {count > 0 && `(${count})`}
            </Link>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ background: '#0a0a0a', borderTop: '1px solid #1f1f1f', marginTop: 'auto' }}>

        <div style={{ background: '#f97316', padding: '1.25rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: 16 }}>¿Listo para transformar tu camioneta?</p>
              <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Escríbenos y te asesoramos sin costo</p>
            </div>
            <a href="https://wa.me/56973841370?text=Hola,%20estoy%20interesado%20en%20cotizar%20algunos%20productos%20de%20Torque%20Off%20Road.%20¿Me%20pueden%20ayudar?" target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#f97316', padding: '0.6rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Contactar por WhatsApp
            </a>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Truck size={20} color="#f97316" />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>
                Torque <span style={{ color: '#f97316' }}>Off Road</span>
              </span>
            </div>
            <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
              Especialistas en kits de suspensión y accesorios para camionetas pick-up. Asesoría real basada en experiencia de terreno.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="https://www.facebook.com/profile.php?id=61576332436968" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: '#1a1a1a', borderRadius: 8, color: '#aaa', textDecoration: 'none', border: '1px solid #2a2a2a' }}>
                <FacebookIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, background: '#1a1a1a', borderRadius: 8, color: '#aaa', textDecoration: 'none', border: '1px solid #2a2a2a' }}>
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>Navegación</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/',         label: 'Inicio' },
                { to: '/catalogo', label: 'Catálogo de productos' },
                { to: '/nosotros', label: 'Quiénes somos' },
                { to: '/cotizar',  label: 'Solicitar cotización' },
                { to: '/contacto', label: 'Contacto' },
              ].map((l) => (
                <Link key={l.to} to={l.to}
                  style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}
                  onMouseEnter={(e) => e.target.style.color = '#f97316'}
                  onMouseLeave={(e) => e.target.style.color = '#666'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>Servicios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Kits de suspensión', 'Bandejas reforzadas', 'Rótulas extendidas', 'Espaciadores de rueda', 'Instalación coordinada', 'Envíos a todo Chile'].map((s) => (
                <span key={s} style={{ color: '#666', fontSize: 14 }}>{s}</span>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>Contacto</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { Icon: MapPin, text: 'El Sol 261, La Florida, Santiago' },
                { Icon: Phone,  text: '+56 9 7384 1370', href: 'tel:+56973841370' },
                { Icon: Mail,   text: 'czenteno3@gmail.com', href: 'mailto:czenteno3@gmail.com' },
              ].map(({ Icon, text, href }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Icon size={15} color="#f97316" style={{ flexShrink: 0, marginTop: 2 }} />
                  {href
                    ? <a href={href} style={{ color: '#666', fontSize: 14, textDecoration: 'none' }}>{text}</a>
                    : <span style={{ color: '#666', fontSize: 14 }}>{text}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1a1a1a', padding: '1.25rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ margin: 0, color: '#444', fontSize: 13 }}>© {new Date().getFullYear()} Torque Off Road. Todos los derechos reservados.</p>
            <p style={{ margin: 0, color: '#444', fontSize: 13 }}>Hecho con pasión por el 4×4 🛻</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </div>
  )
}