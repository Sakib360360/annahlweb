import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../models/userModel.js'
import Admin from '../models/adminModel.js'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI missing')

await mongoose.connect(uri)

const desired = {
  username: 'sakib',
  password: 'sakib01',
  role: 'management',
  name: 'sakib',
  active: true,
  email: null,
  profilePhoto: '',
}

const existing = await Admin.findOne({ role: 'management' }).sort({ createdAt: 1 })
if (existing) {
  existing.username = desired.username
  existing.id = existing.id || 'm1'
  existing.password = desired.password
  existing.role = 'management'
  existing.name = desired.name
  existing.active = true
  existing.email = null
  await existing.save()
} else {
  await Admin.create({
    id: 'm1',
    username: desired.username,
    role: 'management',
    name: desired.name,
    title: 'Management',
    email: null,
    phone: '',
    profilePhoto: '',
    active: true,
    joinedDate: '',
    password: desired.password,
  })
}

await Admin.deleteMany({ role: 'management', username: { $ne: desired.username } })

await User.findOneAndUpdate({ username: desired.username }, desired, { upsert: true, new: true })
await User.deleteMany({ role: 'management', username: { $ne: desired.username } })

console.log('Management credentials set to:', { id: desired.username, password: desired.password })

await mongoose.disconnect()
