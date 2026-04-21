import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useCategories } from '../../hooks/useProducts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '../../services/index'
import toast from 'react-hot-toast'

function CategoryModal({ category, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: category || {} })
  const qc = useQueryClient()

  const save = useMutation({
    mutationFn: (data) => category ? categoryService.update(category.id, data) : categoryService.create(data),
    onSuccess: () => { toast.success(category ? 'Categoría actualizada' : 'Categoría creada'); qc.invalidateQueries({ queryKey: ['categories'] }); onClose() },
    onError: (e) => toast.error(e.response?.data?.error || 'Error'),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{category ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => save.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Nombre *</label>
            <input {...register('name', { required: 'Requerido' })}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${errors.name ? '#ef4444' : '#ddd'}`, borderRadius: 6, fontSize: 14 }} />
            {errors.name && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.name.message}</p>}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Descripción</label>
            <textarea {...register('description')} rows={2}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={save.isPending} style={{ padding: '0.6rem 1.25rem', border: 'none', borderRadius: 6, background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              {save.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriasPage() {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const { data: categories = [], isLoading } = useCategories()
  const qc = useQueryClient()

  const deleteCategory = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: () => { toast.success('Categoría eliminada'); qc.invalidateQueries({ queryKey: ['categories'] }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Error al eliminar'),
  })

  const handleEdit = (cat) => { setEditing(cat); setModal(true) }
  const handleClose = () => { setEditing(null); setModal(false) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Categorías</h2>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {isLoading ? <p style={{ color: '#888' }}>Cargando...</p> :
          categories.map((cat) => (
            <div key={cat.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{cat.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>{cat.slug}</p>
                </div>
                <span style={{ background: '#f97316' + '20', color: '#f97316', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>
                  {cat.product_count} productos
                </span>
              </div>
              {cat.description && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666' }}>{cat.description}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEdit(cat)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>
                  <Pencil size={13} /> Editar
                </button>
                <button onClick={() => confirm(`¿Eliminar "${cat.name}"?`) && deleteCategory.mutate(cat.id)}
                  style={{ padding: '6px 10px', border: '1px solid #fecaca', borderRadius: 6, background: '#fff', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {modal && <CategoryModal category={editing} onClose={handleClose} />}
    </div>
  )
}
