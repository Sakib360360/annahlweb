import mongoose from 'mongoose'
import Student from '../models/studentModel.js'
import Teacher from '../models/teacherModel.js'
import { verifyCredentials, findUserById, findUserByEmail } from '../models/dataStore.js'

async function verifyMongoCredentials({ id, email, password }) {
  const query = {}
  if (id) query.id = id
  if (email) query.email = email
  if (!id && !email) return null

  const student = await Student.findOne(query).lean()
  if (student && student.password === password) {
    const { password: _pw, __v, _id, ...rest } = student
    return rest
  }

  const teacher = await Teacher.findOne(query).lean()
  if (teacher && teacher.password === password) {
    const { password: _pw, __v, _id, ...rest } = teacher
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
  if (id === 'a1' && password === 'a123') {
    user = {
      id: 'a1',
      name: 'Fatima Sultana',
      role: 'admin',
      email: 'fatima.sultana@annahlacademy.edu',
    }
  }

  if (!user && mongoose.connection.readyState === 1) {
    user = await verifyMongoCredentials({ id, email, password })
  }

  if (!user) {
    const candidate = findUserById(id) || findUserByEmail(email)
    if (candidate && candidate.password === password) {
      user = candidate
    }
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  delete user.password
  return res.json({ user, token: 'fake-jwt-token' })
}
