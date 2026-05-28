import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X, Search, Upload, ImageOff } from 'lucide-react'
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts'
import Pagination from '../../components/Pagination'
import { formatCLP } from '../../utils/format'
import { useAuthStore } from '../../context/authStore'
import api from '../../services/api'
import toast from 'react-hot-toast'

// ── Componente de subida de imágenes ──────────────────────────
function ImageUploader({ productId, existingImages = [], onImagesChange }) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages]       = useState(existingImages)
  const fileRef = useRef()

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview local inmediata mientras sube
    const localUrl = URL.createObjectURL(file)
    const tempId   = 'temp-' + Date.now()
    const preview  = { id: tempId, url: localUrl, uploading: true }
    const updated  = [...images, preview]
    setImages(updated)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await api.post(`/uploads/product/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Reemplazar preview temporal con la URL real de Cloudinary
      const final = updated.map((img) =>
        img.id === tempId ? { ...res.data.data, uploading: false } : img
      )
      setImages(final)
      onImagesChange?.(final)
      toast.success('Imagen subida')
    } catch (err) {
      // Quitar la preview si falla
      setImages(images)
      toast.error(err.response?.data?.error || 'Error al subir imagen')
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  const handleDelete = async (imageId) => {
    if (imageId.toString().startsWith('temp-')) return
    try {
      await api.delete(`/uploads/image/${imageId}`)
      const updated = images.filter((img) => img.id !== imageId)
      setImages(updated)
      onImagesChange?.(updated)
      toast.success('Imagen eliminada')
    } catch {
      toast.error('Error al eliminar imagen')
    }
  }

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>
        Imágenes del producto
      </label>

      {/* Grid de imágenes actuales */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: 'relative', width: 80, height: 80 }}>
              <img
                src={img.url}
                alt="producto"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  borderRadius: 6, border: '1px solid #eee',
                  opacity: img.uploading ? 0.5 : 1,
                }}
              />
              {img.uploading && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)', borderRadius: 6,
                  fontSize: 11, color: '#fff',
                }}>
                  Subiendo...
                </div>
              )}
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    background: '#ef4444', border: 'none', borderRadius: '50%',
                    width: 20, height: 20, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', padding: 0,
                  }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botón de subida */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => fileRef.current.click()}
        disabled={uploading}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0.5rem 1rem', border: '1px dashed #ddd',
          borderRadius: 6, background: '#fafafa',
          fontSize: 13, color: '#666', cursor: uploading ? 'not-allowed' : 'pointer',
          width: '100%', justifyContent: 'center',
        }}
      >
        <Upload size={14} />
        {uploading ? 'Subiendo...' : 'Agregar imagen'}
      </button>
      <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
        JPG, PNG o WEBP · Máx. 5MB
      </p>
    </div>
  )
}

// ── Modal de formulario ────────────────────────────────────────
function ProductModal({ product, categories, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || { stock_status: 'bajo_pedido', is_active: true },
  })
  const create    = useCreateProduct()
  const update    = useUpdateProduct()
  const isPending = create.isPending || update.isPending
  const [savedId, setSavedId] = useState(product?.id || null)
  const qc = useQueryClient()

  // Al cerrar tras subir imágenes, forzamos recarga de la lista
  const handleClose = () => {
    if (savedId) qc.invalidateQueries({ queryKey: ['products'] })
    onClose()
  }

  // Categorías seleccionadas como array de IDs
  const [selectedCategories, setSelectedCategories] = useState(
    product?.categories?.map((c) => c.id) ?? []
  )
  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const onSubmit = async (data) => {
    const payload = { ...data, price: parseInt(data.price), category_ids: selectedCategories }
    // Quitar el campo category legacy si viene
    delete payload.category
    if (product) {
      update.mutate({ id: product.id, data: payload }, { onSuccess: onClose })
    } else {
      create.mutate(payload, {
        onSuccess: (newProduct) => {
          setSavedId(newProduct.id)
          toast.success('Producto creado — ahora puedes agregar imágenes')
        },
      })
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '0.6rem 0.75rem',
    border: `1px solid ${hasError ? '#ef4444' : '#ddd'}`,
    borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '2rem',
        width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {product ? 'Editar producto' : savedId ? 'Agregar imágenes' : 'Nuevo producto'}
          </h2>
          <button onClick={savedId ? handleClose : onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <X size={20} />
          </button>
        </div>

        {/* Si el producto ya fue creado, mostrar uploader de imágenes */}
        {savedId && !product ? (
          <div>
            <p style={{ fontSize: 14, color: '#666', marginBottom: '1rem' }}>
              Producto creado. Puedes agregar imágenes ahora o hacerlo más tarde desde "Editar".
            </p>
            <ImageUploader productId={savedId} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={handleClose} style={{
                padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6,
                background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>
                Listo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input {...register('name', { required: 'Requerido' })} style={inputStyle(errors.name)} />
              {errors.name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.name.message}</p>}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Descripción</label>
              <textarea {...register('description')} rows={3}
                style={{ ...inputStyle(false), resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Precio (CLP) *</label>
                <input type="number"
                  {...register('price', { required: 'Requerido', min: { value: 1, message: 'Debe ser mayor a 0' } })}
                  style={inputStyle(errors.price)} placeholder="150000" />
                {errors.price && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.price.message}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Marca</label>
                <input {...register('brand')} style={inputStyle(false)} placeholder="Dobinsons, Bilstein..." />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Categorías</label>
              {categories.length === 0 ? (
                <p style={{ fontSize: 13, color: '#aaa' }}>No hay categorías creadas aún</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {categories.map((c) => {
                    const selected = selectedCategories.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.id)}
                        style={{
                          padding: '5px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                          border: `1px solid ${selected ? '#f97316' : '#ddd'}`,
                          background: selected ? '#fff7ed' : '#fff',
                          color: selected ? '#c2410c' : '#555',
                          fontWeight: selected ? 600 : 400,
                          transition: 'all 0.15s',
                        }}
                      >
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Disponibilidad</label>
              <select {...register('stock_status')} style={{ ...inputStyle(false), background: '#fff' }}>
                <option value="bajo_pedido">Bajo pedido</option>
                <option value="disponible">Disponible</option>
              </select>
            </div>

            {/* Imágenes — solo visible al editar (el producto ya tiene id) */}
            {product && (
              <ImageUploader
                productId={product.id}
                existingImages={product.images || []}
              />
            )}

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
        )}
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────
export default function ProductosPage() {
  const [search, setSearch]                 = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage]                     = useState(1)
  const [modalOpen, setModalOpen]           = useState(false)
  const [editing, setEditing]               = useState(null)

  const handleCategoryFilter = (value) => { setCategoryFilter(value); setPage(1) }

  const { data: result, isLoading } = useProducts({
    category: categoryFilter || undefined,
    page,
    limit: 20,
  })
  const products   = result?.data       ?? []
  const pagination = result?.pagination ?? null
  const { data: categories = [] }          = useCategories()
  const deleteProduct                      = useDeleteProduct()

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const handleEdit  = (product) => { setEditing(product); setModalOpen(true) }
  const handleNew   = () => { setEditing(null); setModalOpen(true) }
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
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>
        <select value={categoryFilter} onChange={(e) => handleCategoryFilter(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none' }}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="prod-table-wrap" style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
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
                    {/* Miniatura */}
                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', border: '1px solid #eee', flexShrink: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.main_image
                        ? <img src={p.main_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <ImageOff size={16} color="#ccc" />
                      }
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{p.name}</p>
                      {p.brand && <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{p.brand}</p>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#666' }}>{p.sku || '-'}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 13, color: '#666' }}>
                  {p.categories?.length > 0
                    ? p.categories.map((c) => (
                        <span key={c.id} style={{ display: 'inline-block', background: '#f3f4f6', borderRadius: 20, padding: '1px 8px', fontSize: 11, marginRight: 4 }}>{c.name}</span>
                      ))
                    : '-'}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 14, fontWeight: 600 }}>{formatCLP(p.price)}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: p.stock_status === 'disponible' ? '#dcfce7' : '#fef3c7',
                    color: p.stock_status === 'disponible' ? '#166534' : '#92400e',
                  }}>
                    {p.stock_status === 'disponible' ? 'Disponible' : 'Bajo pedido'}
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
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Cards móvil */}
      <div className="prod-cards-wrap" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No hay productos</p>
        ) : filtered.map((p) => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '1rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <div style={{ width: 60, height: 60, background: '#f8f8f6', borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.main_image
                ? <img src={p.main_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 10, color: '#ccc' }}>Sin img</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#aaa' }}>{p.sku}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {p.categories?.map((c) => (
                  <span key={c.id} style={{ background: '#f3f4f6', borderRadius: 20, padding: '1px 7px', fontSize: 11 }}>{c.name}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{formatCLP(p.price)}</span>
                  <span style={{ background: p.stock_status === 'disponible' ? '#dcfce7' : '#fff7ed', color: p.stock_status === 'disponible' ? '#166534' : '#c2410c', fontSize: 11, padding: '1px 7px', borderRadius: 20 }}>
                    {p.stock_status === 'disponible' ? 'Disponible' : 'Bajo pedido'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleEdit(p)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#555' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <style>{`
        @media (max-width: 767px) {
          .prod-table-wrap { display: none !important; }
          .prod-cards-wrap { display: flex !important; }
        }
      `}</style>

      {modalOpen && (
        <ProductModal product={editing} categories={categories} onClose={handleClose} />
      )}
    </div>
  )
}