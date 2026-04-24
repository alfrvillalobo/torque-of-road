import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, SlidersHorizontal, Check } from 'lucide-react'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { useCartStore, selectCount } from '../../context/cartStore'
import { formatCLP } from '../../utils/format'

function AddToCartButton({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button onClick={handleAdd} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: added ? '#16a34a' : '#111',
      color: '#fff', border: 'none', borderRadius: 6,
      padding: '7px 12px', fontSize: 13, fontWeight: 500,
      cursor: 'pointer', transition: 'background 0.25s',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {added ? <Check size={14} /> : <ShoppingCart size={14} />}
      {added ? '¡Agregado!' : 'Cotizar'}
    </button>
  )
}

function ProductCard({ product }) {
  return (
    <Link to={`/producto/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ height: 200, background: '#f8f8f6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {product.main_image ? (
            <img src={product.main_image} alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#ccc', fontSize: 13, textAlign: 'center' }}>
              <ShoppingCart size={32} color="#ddd" style={{ marginBottom: 6 }} />
              <div>Sin imagen</div>
            </div>
          )}
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: product.stock_status === 'disponible' ? '#22c55e' : '#f97316',
            color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
          }}>
            {product.stock_status === 'disponible' ? 'Disponible' : 'Bajo pedido'}
          </span>
        </div>

        <div style={{ padding: '1rem' }}>
          {product.brand && (
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#f97316', textTransform: 'uppercase', letterSpacing: 1 }}>
              {product.brand}
            </p>
          )}
          <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, lineHeight: 1.3, minHeight: 40 }}>
            {product.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>{formatCLP(product.price)}</p>
            <AddToCartButton product={product} />
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
    make:     make     || undefined,
    model:    model    || undefined,
  })
  const { data: categories = [] } = useCategories()
  const cartCount = useCartStore(selectCount)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Catálogo</h1>
        <p style={{ color: '#666', margin: 0 }}>Kits de suspensión, bandejas reforzadas y accesorios para tu camioneta</p>
      </div>

      {cartCount > 0 && (
        <div style={{ background: '#111', color: '#fff', borderRadius: 10, padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#f97316', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShoppingCart size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 14 }}>
              Tienes <strong>{cartCount} producto{cartCount !== 1 ? 's' : ''}</strong> en tu cotización
            </span>
          </div>
          <Link to="/cotizar" style={{ background: '#f97316', color: '#fff', textDecoration: 'none', padding: '0.45rem 1rem', borderRadius: 6, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Ver cotización →
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o marca..."
            style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.25rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '0.65rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none' }}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {showFilters && (
        <div style={{ background: '#f8f8f6', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Marca</label>
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
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, outline: 'none' }} />
          </div>
          <button onClick={() => { setMake(''); setModel('') }}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>
            Limpiar
          </button>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#888', marginBottom: '1rem' }}>
        {isLoading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ background: '#f5f5f5', borderRadius: 10, height: 340 }} />)}
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