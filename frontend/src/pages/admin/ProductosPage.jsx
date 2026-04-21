import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts'
import { formatCLP } from '../../utils/format'

// ── Modal de formulario ────────────────────────────────────────
function ProductModal({ product, categories, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || { stock_status: 'bajo_pedido', is_active: true },
  })
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const isPending = create.isPending || update.isPending

  const onSubmit = (data) => {
    // Convertir price a número
    const payload = { ...data, price: parseInt(data.price) }
    if (product) {
      update.mutate({ id: product.id, data: payload }, { onSuccess: onClose })
    } else {
      create.mutate(payload, { onSuccess: onClose })
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '0.6rem 0.75rem',
    border: `1px solid ${hasError ? '#ef4444' : '#ddd'}`,
    borderRadius: 6, fontSize: 14, outline: 'none',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '2rem',
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input {...register('name', { required: 'Requerido' })} style={inputStyle(errors.name)} />
              {errors.name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>SKU</label>
              <input {...register('sku')} style={inputStyle(false)} placeholder="TOR-001" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Descripción</label>
            <textarea {...register('description')} rows={3}
              style={{ ...inputStyle(false), resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Precio (CLP) *</label>
              <input type="number" {...register('price', { required: 'Requerido', min: { value: 1, message: 'Debe ser mayor a 0' } })}
                style={inputStyle(errors.price)} placeholder="150000" />
              {errors.price && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.price.message}</p>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Marca</label>
              <input {...register('brand')} style={inputStyle(false)} placeholder="Dobinsons, Bilstein..." />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Categoría</label>
              <select {...register('category')} style={{ ...inputStyle(false), background: '#fff' }}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Disponibilidad</label>
              <select {...register('stock_status')} style={{ ...inputStyle(false), background: '#fff' }}>
                <option value="bajo_pedido">Bajo pedido</option>
                <option value="disponible">Disponible</option>
                <option value="sin_stock">Sin stock</option>
              </select>
            </div>
          </div>

          {product && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="is_active" {...register('is_active')} />
              <label htmlFor="is_active" style={{ fontSize: 14 }}>Producto activo</label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{
              padding: '0.6rem 1.25rem', borderRadius: 6, border: '1px solid #ddd',
              background: '#fff', fontSize: 14, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending} style={{
              padding: '0.6rem 1.25rem', borderRadius: 6, border: 'none',
              background: isPending ? '#fdba74' : '#f97316', color: '#fff',
              fontSize: 14, fontWeight: 500, cursor: isPending ? 'not-allowed' : 'pointer',
            }}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────
export default function ProductosPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: products = [], isLoading } = useProducts({ category: categoryFilter || undefined })
  const { data: categories = [] } = useCategories()
  const deleteProduct = useDeleteProduct()

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const handleEdit = (product) => { setEditing(product); setModalOpen(true) }
  const handleNew  = () => { setEditing(null); setModalOpen(true) }
  const handleClose = () => { setEditing(null); setModalOpen(false) }

  const handleDelete = (product) => {
    if (confirm(`¿Desactivar "${product.name}"?`)) {
      deleteProduct.mutate(product.id)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Productos</h2>
        <button onClick={handleNew} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f97316', color: '#fff', border: 'none',
          borderRadius: 8, padding: '0.6rem 1.25rem', fontSize: 14,
          fontWeight: 500, cursor: 'pointer',
        }}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' }}
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none' }}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f8f6', borderBottom: '1px solid #eee' }}>
              {['Producto', 'SKU', 'Categoría', 'Precio', 'Estado', 'Acciones'].map((h) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#555' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No hay productos</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.main_image && (
                      <img src={p.main_image} alt={p.name}
                        style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', border: '1px solid #eee' }} />
                    )}
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{p.name}</p>
                      {p.brand && <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{p.brand}</p>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#666' }}>{p.sku || '-'}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#666' }}>{p.category || '-'}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 14, fontWeight: 600 }}>{formatCLP(p.price)}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: p.stock_status === 'disponible' ? '#dcfce7' : '#fef3c7',
                    color: p.stock_status === 'disponible' ? '#166534' : '#92400e',
                  }}>
                    {p.stock_status === 'disponible' ? 'Disponible' : p.stock_status === 'sin_stock' ? 'Sin stock' : 'Bajo pedido'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEdit(p)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#555' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductModal product={editing} categories={categories} onClose={handleClose} />
      )}
    </div>
  )
}
