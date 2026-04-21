import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react'
import { useProductBySlug } from '../../hooks/useProducts'
import { useCartStore } from '../../context/cartStore'
import { formatCLP } from '../../utils/format'
import toast from 'react-hot-toast'

export default function ProductoPage() {
  const { slug } = useParams()
  const { data: product, isLoading, error } = useProductBySlug(slug)
  const addItem = useCartStore((s) => s.addItem)

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>Cargando...</div>
  if (error || !product) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <p style={{ color: '#888' }}>Producto no encontrado.</p>
      <Link to="/catalogo" style={{ color: '#f97316' }}>Volver al catálogo</Link>
    </div>
  )

  const handleAdd = () => {
    addItem(product)
    toast.success('Agregado a tu cotización')
  }

  const mainImage = product.images?.[0]?.url || null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <Link to="/catalogo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', textDecoration: 'none', fontSize: 14, marginBottom: '1.5rem' }}>
        <ArrowLeft size={15} /> Volver al catálogo
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Imagen */}
        <div style={{ aspectRatio: '1', background: '#f5f5f5', borderRadius: 12, overflow: 'hidden' }}>
          {mainImage
            ? <img src={mainImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Sin imagen</div>
          }
        </div>

        {/* Info */}
        <div>
          {product.brand && (
            <p style={{ margin: '0 0 8px', color: '#f97316', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {product.brand}
            </p>
          )}
          <h1 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{product.name}</h1>

          {product.sku && <p style={{ margin: '0 0 16px', fontSize: 13, color: '#aaa' }}>SKU: {product.sku}</p>}

          <p style={{ margin: '0 0 24px', fontSize: 30, fontWeight: 800, color: '#111' }}>{formatCLP(product.price)}</p>

          {/* Disponibilidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: product.stock_status === 'disponible' ? '#22c55e' : '#f97316',
            }} />
            <span style={{ fontSize: 14, color: '#555' }}>
              {product.stock_status === 'disponible' ? 'Disponible para despacho inmediato' : 'Disponible bajo pedido · 3-7 días hábiles'}
            </span>
          </div>

          {product.description && (
            <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description}</p>
          )}

          {/* Vehículos compatibles */}
          {product.compatible_vehicles?.length > 0 && (
            <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>Compatible con:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.compatible_vehicles.map((v) => (
                  <span key={v.id} style={{
                    background: '#fff', border: '1px solid #ddd',
                    borderRadius: 6, padding: '3px 10px', fontSize: 13,
                  }}>
                    {v.make} {v.model} {v.year_from}{v.year_to && v.year_to !== v.year_from ? `–${v.year_to}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botón */}
          <button onClick={handleAdd} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', background: '#111', color: '#fff', border: 'none',
            borderRadius: 10, padding: '1rem', fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            <ShoppingCart size={18} /> Agregar a cotización
          </button>

          {/* Garantías */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Asesoría personalizada incluida', 'Envíos a todo Chile', 'Instalación coordinada disponible'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                <CheckCircle size={14} color="#22c55e" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
