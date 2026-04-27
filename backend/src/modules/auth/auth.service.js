const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const UserRepository = require('./user.repository')

// Fix #3: JWT_EXPIRES puede vivir en scope de módulo (no cambia en runtime)
// pero JWT_SECRET se lee dentro de signToken para evitar que sea undefined
// si dotenv aún no cargó cuando Node importó este módulo
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

function signToken(user) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está configurado en las variables de entorno')
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: JWT_EXPIRES }
  )
}

const AuthService = {
  // Fix #4: register ahora requiere que quien llame tenga rol admin.
  // La validación de permisos se hace en la ruta (requireAuth + requireAdmin),
  // pero aquí bloqueamos explícitamente cualquier intento de auto-asignarse rol admin
  async register({ name, email, password }) {
    if (!name || name.trim().length < 2) {
      const err = new Error('El nombre debe tener al menos 2 caracteres')
      err.status = 400; throw err
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = new Error('Email inválido')
      err.status = 400; throw err
    }
    if (!password || password.length < 8) {
      const err = new Error('La contraseña debe tener al menos 8 caracteres')
      err.status = 400; throw err
    }
    if (await UserRepository.emailExists(email)) {
      const err = new Error('El email ya está registrado')
      err.status = 409; throw err
    }

    const hashed = await bcrypt.hash(password, 12)
    // El role siempre se fuerza a 'user' aquí — el único admin
    // se crea directamente en DB o via script seguro
    const user = await UserRepository.create({ name: name.trim(), email, password: hashed, role: 'user' })
    return { user, token: signToken(user) }
  },

  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email y contraseña son requeridos')
      err.status = 400; throw err
    }

    const user = await UserRepository.findByEmail(email)
    if (!user) {
      const err = new Error('Credenciales incorrectas')
      err.status = 401; throw err
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      const err = new Error('Credenciales incorrectas')
      err.status = 401; throw err
    }

    const { password: _, ...safeUser } = user
    return { user: safeUser, token: signToken(safeUser) }
  },

  async me(userId) {
    const user = await UserRepository.findById(userId)
    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.status = 404; throw err
    }
    return user
  },
}

module.exports = AuthService