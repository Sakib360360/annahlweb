import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/userModel.js'
import Admin from '../models/adminModel.js'
import Student from '../models/studentModel.js'
import Teacher from '../models/teacherModel.js'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('MONGODB_URI missing in server environment')
}

await mongoose.connect(uri)

await Promise.all([
  Student.deleteMany({ $or: [{ id: 's1' }, { username: 's1' }, { name: /sample/i }] }),
  Teacher.deleteMany({ $or: [{ id: 't1' }, { username: 't1' }, { name: /sample/i }] }),
  Admin.deleteMany({ $or: [{ id: 'a1' }, { username: 'a1' }, { username: 'MN01' }, { name: /sample/i }] }),
  User.deleteMany({ $or: [{ username: { $in: ['s1', 't1', 'a1', 'MN01'] } }, { name: /sample/i }] }),
])

const existingSakibAdmin = await Admin.findOne({ username: 'Sakib' })
if (existingSakibAdmin) {
  existingSakibAdmin.role = 'management'
  existingSakibAdmin.name = 'Sakib'
  existingSakibAdmin.password = 'sakib01'
  existingSakibAdmin.active = true
  existingSakibAdmin.title = existingSakibAdmin.title || 'Management'
  existingSakibAdmin.email = existingSakibAdmin.email || null
  await existingSakibAdmin.save()
} else {
  await Admin.create({
    id: 'm1',
    username: 'Sakib',
    role: 'management',
    name: 'Sakib',
    title: 'Management',
    email: null,
    phone: '',
    profilePhoto: '',
    active: true,
    joinedDate: '',
    password: 'sakib01',
  })
}

await Admin.deleteMany({ role: 'management', username: { $ne: 'Sakib' } })

await User.findOneAndUpdate(
  { username: 'Sakib' },
  {
    username: 'Sakib',
    password: 'sakib01',
    role: 'management',
    name: 'Sakib',
    active: true,
    email: null,
    profilePhoto: '',
  },
  { upsert: true, new: true },
)

await User.deleteMany({ role: 'management', username: { $ne: 'Sakib' } })

const counts = {
  users: await User.countDocuments({}),
  admins: await Admin.countDocuments({}),
  students: await Student.countDocuments({}),
  teachers: await Teacher.countDocuments({}),
  mgmtUsers: await User.countDocuments({ role: 'management' }),
  mgmtAdmins: await Admin.countDocuments({ role: 'management' }),
}

console.log('Production cleanup complete', counts)

await mongoose.disconnect()
