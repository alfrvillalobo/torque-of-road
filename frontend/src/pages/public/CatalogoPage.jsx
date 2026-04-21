import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { useCartStore } from '../../context/cartStore'
import { formatCLP } from '../../utils/format'
import toast from 'react-hot-toast'

function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} agregado a cotización`)
  }

  return (
    <Link to={`/producto/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #eee',
        overflow: 'hidden', transition: 'box-shadow 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* Imagen */}
        <div style={{ aspectRatio: '4/3', background: '#f5f5f5', overflow: 'hidden', position: 'relative' }}>
          {product.main_image ? (
            <img src={product.main_image} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 13 }}>
              Sin imagen
            </div>
          )}
          {/* Badge stock */}
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: product.stock_status === 'disponible' ? '#22c55e' : '#f97316',
            color: '#fff', fontSize: 11, fontWeight: 600,
            padding: '2px 8px', borderRadius: 20,
          }}>
            {product.stock_status === 'disponible' ? 'Disponible' : 'Bajo pedido'}
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: '1rem' }}>
          {product.brand && (
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#f97316', textTransform: 'uppercase', letterSpacing: 1 }}>
              {product.brand}
            </p>
          )}
          <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{product.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>{formatCLP(product.price)}</p>
            <button onClick={handleAdd} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#111', color: '#fff', border: 'none',
              borderRadius: 6, padding: '6px 12px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
            }}>
              <ShoppingCart size={14} /> Cotizar
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CatalogoPage() {
  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('')
  const [make, setMake]               = useState('')
  const [model, setModel]             = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: products = [], isLoading } = useProducts({
    category: category || undefined,
    make: make || undefined,
    model: model || undefined,
  })
  const { data: categories = [] } = useCategories()

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Catálogo</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Kits de suspensión, bandejas reforzadas y accesorios para tu camioneta
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o marca..."
            style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.25rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '0.65rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none' }}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        <button onClick={() => setShowFilters(!showFilters)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.65rem 1rem', border: '1px solid #ddd', borderRadius: 8,
          background: showFilters ? '#111' : '#fff', color: showFilters ? '#fff' : '#333',
          fontSize: 14, cursor: 'pointer',
        }}>
          <SlidersHorizontal size={15} /> Filtrar por vehículo
        </button>
      </div>

      {/* Filtro por vehículo */}
      {showFilters && (
        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Marca vehículo</label>
            <select value={make} onChange={(e) => setMake(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: '#fff' }}>
              <option value="">Todas</option>
              {['Toyota', 'Ford', 'Chevrolet', 'Mitsubishi', 'Nissan', 'Volkswagen', 'Mercedes-Benz'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Modelo</label>
            <input value={model} onChange={(e) => setModel(e.target.value)}
              placeholder="Hilux, Ranger, D-Max..."
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setMake(''); setModel('') }}
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Resultados */}
      <p style={{ fontSize: 13, color: '#888', marginBottom: '1rem' }}>
        {isLoading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#f5f5f5', borderRadius: 10, height: 320, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
          <p style={{ fontSize: 16 }}>No se encontraron productos con esos filtros.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
