export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null

  const { page, totalPages, total, limit } = pagination
  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.875rem 1rem', borderTop: '1px solid #eee',
      flexWrap: 'wrap', gap: '0.5rem',
    }}>
      <span style={{ fontSize: 13, color: '#888' }}>
        Mostrando {from}–{to} de {total} registros
      </span>

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            padding: '4px 12px', border: '1px solid #ddd', borderRadius: 6,
            background: page === 1 ? '#f8f8f6' : '#fff',
            color: page === 1 ? '#ccc' : '#555',
            cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13,
          }}>
          ← Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} style={{ padding: '4px 6px', fontSize: 13, color: '#aaa' }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={{
                  padding: '4px 10px', border: '1px solid',
                  borderColor: p === page ? '#f97316' : '#ddd',
                  borderRadius: 6,
                  background: p === page ? '#f97316' : '#fff',
                  color: p === page ? '#fff' : '#555',
                  cursor: p === page ? 'default' : 'pointer',
                  fontSize: 13, fontWeight: p === page ? 600 : 400,
                }}>
                {p}
              </button>
            )
          )
        }

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            padding: '4px 12px', border: '1px solid #ddd', borderRadius: 6,
            background: page === totalPages ? '#f8f8f6' : '#fff',
            color: page === totalPages ? '#ccc' : '#555',
            cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13,
          }}>
          Siguiente →
        </button>
      </div>
    </div>
  )
}