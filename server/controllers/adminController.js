import mongoose from 'mongoose'
import Admin from '../models/adminModel.js'
import User from '../models/userModel.js'

function isMongoConnected() {
  return mongoose.connection.readyState === 1
}

function sanitize(admin) {
  const doc = admin?.toObject ? admin.toObject() : admin
  if (!doc) return null
  const { password, __v, _id, ...rest } = doc
  return rest
}

export async function listAdmins(req, res) {
  try {
    if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected' })
    const admins = await Admin.find({}).select('-password -__v').sort({ createdAt: -1 }).lean()
    return res.json({ data: admins })
  } catch (error) {
    console.error('listAdmins error', error)
    return res.status(500).json({ message: 'Failed to list admins' })
  }
}

export async function createAdmin(req, res) {
  try {
    if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected' })

    const {
      name,
      title,
      username,
      password,
      email,
      phone,
      profilePhoto,
      role,
      active,
      joinedDate,
    } = req.body || {}

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'name, username, and password are required' })
    }

    const count = await Admin.countDocuments({})
    const id = `a${count + 1}`

    const exists = await Admin.findOne({ $or: [{ id }, { username }, ...(email ? [{ email }] : [])] }).lean()
    if (exists) return res.status(409).json({ message: 'Admin username or email already exists' })

    const admin = await Admin.create({
      id,
      username,
      role: role === 'management' ? 'management' : 'admin',
      name,
      title: title || 'Admin Officer',
      email: email || null,
      phone: phone || '',
      profilePhoto: profilePhoto || '',
      active: active !== false,
      joinedDate: joinedDate || '',
      password,
    })

    await User.findOneAndUpdate(
      { username },
      {
        username,
        email: email || null,
        password,
        role: role === 'management' ? 'management' : 'admin',
        name,
        active: active !== false,
        profilePhoto: profilePhoto || '',
      },
      { upsert: true, new: true },
    )

    return res.status(201).json({ data: sanitize(admin) })
  } catch (error) {
    console.error('createAdmin error', error)
    return res.status(500).json({ message: 'Failed to create admin' })
  }
}

function findQuery(paramId) {
  // Accept either a MongoDB ObjectId hex string or the custom string id (e.g. "a1")
  if (mongoose.Types.ObjectId.isValid(paramId) && String(paramId).length === 24) {
    return { $or: [{ _id: new mongoose.Types.ObjectId(paramId) }, { id: paramId }] }
  }
  return { id: paramId }
}

export async function updateAdmin(req, res) {
  try {
    if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected' })

    const admin = await Admin.findOne(findQuery(req.params.id))
    if (!admin) return res.status(404).json({ message: 'Admin not found' })

    const updates = req.body || {}
    Object.assign(admin, updates)
    await admin.save()

    await User.findOneAndUpdate(
      { username: admin.username },
      {
        username: admin.username,
        email: admin.email || null,
        password: admin.password,
        role: admin.role === 'management' ? 'management' : 'admin',
        name: admin.name,
        active: admin.active !== false,
        profilePhoto: admin.profilePhoto || '',
      },
      { upsert: true, new: true },
    )

    return res.json({ data: sanitize(admin) })
  } catch (error) {
    console.error('updateAdmin error', error)
    return res.status(500).json({ message: 'Failed to update admin' })
  }
}

export async function deleteAdmin(req, res) {
  try {
    if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected' })

    const deleted = await Admin.findOneAndDelete(findQuery(req.params.id)).lean()
    if (!deleted) return res.status(404).json({ message: 'Admin not found' })

    await User.findOneAndDelete({ username: deleted.username })

    return res.status(204).end()
  } catch (error) {
    console.error('deleteAdmin error', error)
    return res.status(500).json({ message: 'Failed to delete admin' })
  }
}

export async function toggleAdminStatus(req, res) {
  try {
    if (!isMongoConnected()) return res.status(503).json({ message: 'MongoDB not connected' })

    // Find current record first so we can flip the actual boolean
    const existing = await Admin.findOne(findQuery(req.params.id)).lean()
    if (!existing) return res.status(404).json({ message: 'Admin not found' })

    const newActive = !existing.active

    const updated = await Admin.findOneAndUpdate(
      findQuery(req.params.id),
      { active: newActive },
      { new: true, runValidators: true },
    ).lean()

    await User.findOneAndUpdate(
      { username: updated.username },
      { active: newActive },
      { new: true },
    )

    return res.json({ data: sanitize(updated) })
  } catch (error) {
    console.error('toggleAdminStatus error', error)
    return res.status(500).json({ message: 'Failed to update admin status' })
  }
}
