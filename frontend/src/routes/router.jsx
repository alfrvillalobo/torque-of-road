import { createBrowserRouter } from 'react-router-dom'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout  from '../layouts/AdminLayout'

// Páginas públicas
import HomePage     from '../pages/public/HomePage'
import CatalogoPage from '../pages/public/CatalogoPage'
import ProductoPage from '../pages/public/ProductoPage'
import CotizarPage  from '../pages/public/CotizarPage'
import NosotrosPage from '../pages/public/NosotrosPage'

// Páginas admin
import LoginPage        from '../pages/admin/LoginPage'
import DashboardPage    from '../pages/admin/DashboardPage'
import ProductosPage    from '../pages/admin/ProductosPage'
import CategoriasPage   from '../pages/admin/CategoriasPage'
import CotizacionesPage from '../pages/admin/CotizacionesPage'
import PedidosPage      from '../pages/admin/PedidosPage'

export const router = createBrowserRouter([
  // ── Sitio público ────────────────────────────────
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true,            element: <HomePage /> },
      { path: 'catalogo',       element: <CatalogoPage /> },
      { path: 'producto/:slug', element: <ProductoPage /> },
      { path: 'cotizar',        element: <CotizarPage /> },
      { path: 'nosotros',       element: <NosotrosPage /> },
    ],
  },

  // ── Admin ────────────────────────────────────────
  { path: '/admin/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,          element: <DashboardPage /> },
      { path: 'productos',    element: <ProductosPage /> },
      { path: 'categorias',   element: <CategoriasPage /> },
      { path: 'cotizaciones', element: <CotizacionesPage /> },
      { path: 'pedidos',      element: <PedidosPage /> },
    ],
  },
])