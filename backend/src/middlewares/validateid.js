function validateId(req, res, next) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'El ID debe ser un número entero positivo',
    })
  }
  req.params.id = id
  next()
}
 
module.exports = validateId