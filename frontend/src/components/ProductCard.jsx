import { Link } from 'react-router-dom'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../context/cartStore'
import { formatCLP } from '../utils/format'

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
      cursor: 'pointer',
    }}>
      {added ? <Check size={14} /> : <ShoppingCart size={14} />}
      {added ? '¡Agregado!' : 'Cotizar'}
    </button>
  )
}

export default function ProductCard({ product }) {
  return (
    <Link to={`/producto/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #eee',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer'
      }}>
        <div style={{
          height: 200,
          background: '#f8f8f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          {product.main_image ? (
            <img src={product.main_image} alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#ccc' }}>Sin imagen</div>
          )}
        </div>

        <div style={{ padding: '1rem' }}>
          {product.brand && (
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#f97316', fontWeight: 600 }}>
              {product.brand}
            </p>
          )}

          <p style={{ margin: '0 0 10px', fontWeight: 600 }}>
            {product.name}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontWeight: 700 }}>
              {formatCLP(product.price)}
            </p>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </Link>
  )
}