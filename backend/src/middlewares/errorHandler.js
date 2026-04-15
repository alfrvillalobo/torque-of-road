function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'
 
  // Log del error en servidor (evitar exponer stack en producción)
  if (status === 500) {
    console.error('❌ Error no controlado:', err)
  }
 
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
 
function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
}
 
module.exports = { errorHandler, notFound }