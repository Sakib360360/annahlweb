import mongoose from 'mongoose'
import Student from '../models/studentModel.js'
import Teacher from '../models/teacherModel.js'
import Admin from '../models/adminModel.js'
import User from '../models/userModel.js'
import { verifyCredentials as verifyMemoryCredentials } from '../models/dataStore.js'

function verifyAdminMemoryCredentials({ id, email, password }) {
  const candidate = verifyMemoryCredentials({ id, email, password })
  if (!candidate || candidate.role !== 'admin') return null
  return candidate
}

async function verifyMongoCredentials({ id, email, password }) {
  const value = String(id || '').trim()
  const userQuery = email
    ? { email }
    : {
      $or: [{ username: value }, { id: value }, { email: value }],
    }

  const account = await User.findOne(userQuery).lean().catch(() => null)
  if (account && account.password === password) {
    if (account.active === false) return null
    const { password: _pw, __v, _id, ...rest } = account
    return rest
  }

  const query = {}
  if (id) query.$or = [{ id }, { username: id }]
  if (email) query.email = email
  if (!id && !email) return null

  const student = await Student.findOne(query).lean().catch(() => null)
  if (student && student.password === password) {
    const { password: _pw, __v, _id, ...rest } = student
    await User.findOneAndUpdate(
      { username: student.username || student.id },
      {
        username: student.username || student.id,
        email: student.email || null,
        password: student.password,
        role: 'student',
        name: student.name,
        active: true,
      },
      { upsert: true, new: true },
    )
    return rest
  }

  const teacher = await Teacher.findOne(query).lean().catch(() => null)
  if (teacher && teacher.password === password) {
    const { password: _pw, __v, _id, ...rest } = teacher
    await User.findOneAndUpdate(
      { username: teacher.username || teacher.id },
      {
        username: teacher.username || teacher.id,
        email: teacher.email || null,
        password: teacher.password,
        role: 'teacher',
        name: teacher.name,
        active: teacher.active !== false,
      },
      { upsert: true, new: true },
    )
    return rest
  }

  const admin = await Admin.findOne(query).lean().catch(() => null)
  if (admin && admin.password === password) {
    const { password: _pw, __v, _id, ...rest } = admin
    await User.findOneAndUpdate(
      { username: admin.username || admin.id },
      {
        username: admin.username || admin.id,
        email: admin.email || null,
        password: admin.password,
        role: admin.role === 'management' ? 'management' : 'admin',
        name: admin.name,
        active: admin.active !== false,
      },
      { upsert: true, new: true },
    )
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

  if (mongoose.connection.readyState === 1) {
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
