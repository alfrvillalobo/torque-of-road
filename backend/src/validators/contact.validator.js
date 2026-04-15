// Validación simple sin librerías externas

const validateContact = (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios',
    });
  }

  if (name.length < 2) {
    return res.status(400).json({
      message: 'El nombre es muy corto',
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      message: 'Email inválido',
    });
  }

  next();
};

module.exports = validateContact;