const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserRepository = require('./user.repository')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
}

const AuthService = {
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
    const user = await UserRepository.create({ name: name.trim(), email, password: hashed })
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