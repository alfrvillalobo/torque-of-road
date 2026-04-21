import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../services/productService'
import { categoryService } from '../services/index'
import toast from 'react-hot-toast'

// ─── Productos ────────────────────────────────────────────────
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll(filters),
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  })
}

export function useProductBySlug(slug) {
  return useQuery({
    queryKey: ['product-slug', slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  })
}

export function useCompatibleProducts(params) {
  return useQuery({
    queryKey: ['products-compatible', params],
    queryFn: () => productService.getCompatible(params),
    enabled: !!(params?.make && params?.model),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto creado')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al crear producto'),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto actualizado')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al actualizar'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto desactivado')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al eliminar'),
  })
}

// ─── Categorías ───────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  })
}
