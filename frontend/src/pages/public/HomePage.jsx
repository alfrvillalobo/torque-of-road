import { Link } from 'react-router-dom'
import { ArrowRight, Wrench, Shield, Truck, Phone } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { formatCLP } from '../../utils/format'

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{ display: 'inline-flex', background: '#f97316' + '15', borderRadius: '50%', padding: 16, marginBottom: 16 }}>
        <Icon size={26} color="#f97316" />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

export default function HomePage() {
  const { data: products = [] } = useProducts()
  const featured = products.slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: '#111', color: '#fff',
        padding: '5rem 1.5rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ color: '#f97316', fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Especialistas en 4×4
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Transforma tu camioneta en una herramienta real
          </h1>
          <p style={{ color: '#aaa', fontSize: 17, lineHeight: 1.7, marginBottom: 36 }}>
            Kits de suspensión, bandejas reforzadas y accesorios para pick-up. Asesoría personalizada y envíos a todo Chile.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalogo" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#f97316', color: '#fff', textDecoration: 'none',
              padding: '0.875rem 1.75rem', borderRadius: 8, fontWeight: 600, fontSize: 15,
            }}>
              Ver catálogo <ArrowRight size={16} />
            </Link>
            <Link to="/contacto" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#fff', textDecoration: 'none',
              padding: '0.875rem 1.75rem', borderRadius: 8, fontWeight: 500, fontSize: 15,
              border: '1px solid #444',
            }}>
              <Phone size={16} /> Contactar
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FeatureCard icon={Wrench}  title="Asesoría personalizada" desc="Recomendamos según tu modelo de camioneta y tipo de uso." />
          <FeatureCard icon={Shield}  title="Productos de calidad" desc="Marcas reconocidas: Dobinsons, Bilstein, Old Man Emu y más." />
          <FeatureCard icon={Truck}   title="Envíos a todo Chile" desc="Despachamos desde Santiago a cualquier región del país." />
          <FeatureCard icon={Phone}   title="Atención directa" desc="Habla directamente con Cristóbal vía WhatsApp o teléfono." />
        </div>
      </section>

      {/* Productos destacados */}
      {featured.length > 0 && (
        <section style={{ background: '#f8f8f6', padding: '4rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Productos destacados</h2>
              <Link to="/catalogo" style={{ color: '#f97316', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {featured.map((p) => (
                <Link key={p.id} to={`/producto/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '4/3', background: '#eee', overflow: 'hidden' }}>
                      {p.main_image
                        ? <img src={p.main_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>Sin imagen</div>
                      }
                    </div>
                    <div style={{ padding: '1rem' }}>
                      {p.brand && <p style={{ margin: '0 0 4px', fontSize: 11, color: '#f97316', fontWeight: 600, textTransform: 'uppercase' }}>{p.brand}</p>}
                      <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 14 }}>{p.name}</p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{formatCLP(p.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA WhatsApp */}
      <section style={{ background: '#111', color: '#fff', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700 }}>¿No encuentras lo que buscas?</h2>
        <p style={{ color: '#aaa', marginBottom: 24, fontSize: 15 }}>Escríbenos directamente y te asesoramos según tu camioneta.</p>
        <a href="https://wa.me/56973841370" target="_blank" rel="noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#25d366', color: '#fff', textDecoration: 'none',
          padding: '0.875rem 1.75rem', borderRadius: 8, fontWeight: 600, fontSize: 15,
        }}>
          Escribir por WhatsApp
        </a>
      </section>
    </div>
  )
}
