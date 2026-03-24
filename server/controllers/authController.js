import mongoose from 'mongoose'
import Student from '../models/studentModel.js'
import Teacher from '../models/teacherModel.js'
import Admin from '../models/adminModel.js'
import { verifyCredentials as verifyMemoryCredentials } from '../models/dataStore.js'

const MANAGEMENT_CREDENTIALS = {
  id: 'MN01',
  password: 'MAN001',
  role: 'management',
  name: 'Management',
  title: 'Top Level Access',
}

function verifyAdminMemoryCredentials({ id, email, password }) {
  const candidate = verifyMemoryCredentials({ id, email, password })
  if (!candidate || candidate.role !== 'admin') return null
  return candidate
}

async function verifyMongoCredentials({ id, email, password }) {
  const query = {}
  if (id) query.id = id
  if (email) query.email = email
  if (!id && !email) return null

  const student = await Student.findOne(query).lean().catch(() => null)
  if (student && student.password === password) {
    const { password: _pw, __v, _id, ...rest } = student
    return rest
  }

  const teacher = await Teacher.findOne(query).lean().catch(() => null)
  if (teacher && teacher.password === password) {
    const { password: _pw, __v, _id, ...rest } = teacher
    return rest
  }

  const admin = await Admin.findOne(query).lean().catch(() => null)
  if (admin && admin.password === password) {
    const { password: _pw, __v, _id, ...rest } = admin
    return rest
  }

  return null
}

export async function login(req, res) {
  const { id, email, password } = req.body || {}

  if (!password || (!id && !email)) {
    return res.status(400).json({ message: 'Invalid login payload' })
  }

  let user = null

  const normalizedId = (id || '').trim().toUpperCase()
  const normalizedPassword = String(password || '').trim()
  if (normalizedId === MANAGEMENT_CREDENTIALS.id && normalizedPassword === MANAGEMENT_CREDENTIALS.password) {
    user = {
      id: MANAGEMENT_CREDENTIALS.id,
      role: MANAGEMENT_CREDENTIALS.role,
      name: MANAGEMENT_CREDENTIALS.name,
      title: MANAGEMENT_CREDENTIALS.title,
    }
  }

  if (!user && mongoose.connection.readyState === 1) {
    user = await verifyMongoCredentials({ id, email, password })
  }

  if (!user) {
    user = verifyAdminMemoryCredentials({ id, email, password })
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  delete user.password
  return res.json({ user, token: 'fake-jwt-token' })
}
