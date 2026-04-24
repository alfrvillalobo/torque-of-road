import { Link } from 'react-router-dom'
import { Shield, Wrench, Users, ArrowRight, Star, Truck, MapPin } from 'lucide-react'

function ValueCard({ icon: Icon, title, desc }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '1.5rem' }}>
      <div style={{ display: 'inline-flex', background: '#fff7ed', borderRadius: 8, padding: 10, marginBottom: 14 }}>
        <Icon size={22} color="#f97316" />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

function TeamCard({ name, role, specialty }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '1.5rem', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#111', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 700, margin: '0 auto 14px',
        border: '3px solid #f97316',
      }}>
        {initials}
      </div>
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16 }}>{name}</p>
      <p style={{ margin: '0 0 8px', color: '#f97316', fontSize: 13, fontWeight: 500 }}>{role}</p>
      <p style={{ margin: 0, color: '#888', fontSize: 13 }}>{specialty}</p>
    </div>
  )
}

export default function NosotrosPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#111', color: '#fff', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#f97316', fontWeight: 600, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
            Quiénes somos
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
            Más que una tienda, somos entusiastas del 4×4
          </h1>
          <p style={{ color: '#aaa', fontSize: 16, lineHeight: 1.8, margin: 0 }}>
            En Torque Off Road no solo vendemos piezas — entendemos el uso real de una camioneta en terreno. Cada recomendación que hacemos viene de la experiencia práctica, no de un catálogo.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#f97316', fontWeight: 600, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Nuestra historia
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>
              Nacimos de la pasión por las camionetas
            </h2>
            <p style={{ color: '#555', fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>
              Torque Off Road nació de la necesidad real de encontrar soluciones confiables para camionetas pick-up en Chile. Cristóbal Zenteno, fundador y cara visible del negocio, comenzó asesorando a amigos y conocidos sobre cómo mejorar la suspensión de sus vehículos para trabajo y terreno.
            </p>
            <p style={{ color: '#555', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              Hoy somos un equipo pequeño pero comprometido, enfocado en dar la mejor asesoría personalizada según el modelo de camioneta y el tipo de uso — porque no todas las camionetas son iguales ni todas las personas las usan igual.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[{ num: '100+', label: 'Camionetas mejoradas' }, { num: '3', label: 'Años de experiencia' }, { num: '100%', label: 'Clientes satisfechos' }].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#f97316' }}>{s.num}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Visual decorativo */}
          <div style={{ background: '#111', borderRadius: 16, padding: '2.5rem', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <Truck size={28} color="#f97316" />
              <span style={{ fontWeight: 700, fontSize: 18 }}>Torque <span style={{ color: '#f97316' }}>Off Road</span></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Kits de suspensión para pick-up',
                'Bandejas y rótulas reforzadas',
                'Espaciadores de rueda',
                'Asesoría personalizada sin costo',
                'Instalación coordinada',
                'Envíos a todo Chile',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, background: '#f97316', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ color: '#ccc', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #222', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} color="#f97316" />
              <span style={{ color: '#888', fontSize: 13 }}>El Sol 261, La Florida, Santiago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section style={{ background: '#f8f8f6', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Lo que nos mueve</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#f97316', borderRadius: 8, padding: 8 }}>
                  <Star size={18} color="#fff" />
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Misión</h3>
              </div>
              <p style={{ margin: 0, color: '#555', fontSize: 14, lineHeight: 1.8 }}>
                Transformar camionetas en herramientas reales de aventura y trabajo. En Torque Off Road no solo vendemos suspensión y accesorios: entendemos el uso real del 4x4, asesoramos desde la experiencia y entregamos soluciones firmes, seguras y hechas para durar.
              </p>
            </div>
            <div style={{ background: '#111', borderRadius: 10, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#f97316', borderRadius: 8, padding: 8 }}>
                  <Shield size={18} color="#fff" />
                </div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>Visión</h3>
              </div>
              <p style={{ margin: 0, color: '#aaa', fontSize: 14, lineHeight: 1.8 }}>
                Construir una comunidad donde el 4x4 no sea solo apariencia, sino confianza, rendimiento y carácter. Queremos que Torque Off Road sea sinónimo de respeto en el rubro, marcando una diferencia real en cada camioneta que pasa por nuestras manos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Por qué elegirnos</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <ValueCard icon={Wrench}  title="Experiencia real" desc="Conocemos los vehículos que vendemos. Cada recomendación viene de haberlo visto en terreno." />
          <ValueCard icon={Shield}  title="Productos de calidad" desc="Trabajamos solo con marcas reconocidas: Dobinsons, Bilstein, Old Man Emu y otras de primer nivel." />
          <ValueCard icon={Users}   title="Trato personalizado" desc="Hablas directo con quien sabe. Sin intermediarios, sin respuestas genéricas." />
          <ValueCard icon={Truck}   title="Envíos a todo Chile" desc="Coordinamos el despacho desde Santiago a cualquier región del país de forma segura." />
        </div>
      </section>

      {/* Equipo */}
      <section style={{ background: '#f8f8f6', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>El equipo</h2>
            <p style={{ color: '#666', margin: 0, fontSize: 15 }}>Pequeños en número, grandes en compromiso</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <TeamCard name="Cristóbal Zenteno" role="Fundador y comercial"     specialty="Marketing, ventas y asesoría" />
            <TeamCard name="Patricio Labarca"   role="Logística y operaciones"  specialty="Coordinación y despachos" />
            <TeamCard name="Victor Vázquez"     role="Técnico de instalaciones" specialty="Instalación de kits y accesorios" />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ background: '#111', color: '#fff', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700 }}>¿Quieres mejorar tu camioneta?</h2>
        <p style={{ color: '#aaa', marginBottom: 28, fontSize: 15 }}>
          Cuéntanos tu modelo y uso — te asesoramos sin compromiso.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/catalogo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f97316', color: '#fff', textDecoration: 'none', padding: '0.875rem 1.75rem', borderRadius: 8, fontWeight: 600, fontSize: 15 }}>
            Ver catálogo <ArrowRight size={16} />
          </Link>
          <a href="https://wa.me/56973841370?text=Hola,%20estoy%20interesado%20en%20cotizar%20algunos%20productos%20de%20Torque%20Off%20Road.%20¿Me%20pueden%20ayudar?" target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#fff', textDecoration: 'none', padding: '0.875rem 1.75rem', borderRadius: 8, fontWeight: 500, fontSize: 15, border: '1px solid #444' }}>
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      <style>{`
        @media (max-width: 767px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}