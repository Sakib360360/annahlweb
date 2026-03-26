import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/userModel.js'
import Admin from '../models/adminModel.js'
import Teacher from '../models/teacherModel.js'
import Student from '../models/studentModel.js'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI missing')

await mongoose.connect(uri)

const admins = await Admin.find({}).lean()
const teachers = await Teacher.find({}).lean()
const students = await Student.find({}).lean()

for (const admin of admins) {
  const username = String(admin.username || admin.id || '').trim()
  if (!username || !admin.password) continue
  await User.findOneAndUpdate(
    { username },
    {
      username,
      email: admin.email || null,
      password: admin.password,
      role: admin.role === 'management' ? 'management' : 'admin',
      name: admin.name || username,
      active: admin.active !== false,
      profilePhoto: admin.profilePhoto || '',
    },
    { upsert: true, new: true },
  )
}

for (const teacher of teachers) {
  const username = String(teacher.username || teacher.id || '').trim()
  if (!username || !teacher.password) continue
  await User.findOneAndUpdate(
    { username },
    {
      username,
      email: teacher.email || null,
      password: teacher.password,
      role: 'teacher',
      name: teacher.name || username,
      active: teacher.active !== false,
      profilePhoto: teacher.photoUrl || '',
    },
    { upsert: true, new: true },
  )
}

for (const student of students) {
  const username = String(student.username || student.id || '').trim()
  if (!username || !student.password) continue
  await User.findOneAndUpdate(
    { username },
    {
      username,
      email: student.email || null,
      password: student.password,
      role: 'student',
      name: student.name || username,
      active: true,
      profilePhoto: student.photo || '',
    },
    { upsert: true, new: true },
  )
}

const total = await User.countDocuments({})
console.log('Auth user sync complete. Total users:', total)

await mongoose.disconnect()
