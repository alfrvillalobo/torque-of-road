// Formato de precios en CLP: 150000 → "$150.000"
export function formatCLP(amount) {
  if (amount == null) return '-'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Fecha corta: "2024-03-15" → "15 mar 2024"
export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// Fecha y hora: "15 mar 2024, 14:30"
export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

// Badge de estado con color
export const STATUS_LABELS = {
  pending:     { label: 'Pendiente',   color: 'amber' },
  reviewed:    { label: 'Revisado',    color: 'blue' },
  approved:    { label: 'Aprobado',    color: 'green' },
  rejected:    { label: 'Rechazado',   color: 'red' },
  confirmed:   { label: 'Confirmado',  color: 'blue' },
  in_progress: { label: 'En proceso',  color: 'purple' },
  shipped:     { label: 'Despachado',  color: 'teal' },
  delivered:   { label: 'Entregado',   color: 'green' },
  cancelled:   { label: 'Cancelado',   color: 'red' },
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || { label: status, color: 'gray' }
}
