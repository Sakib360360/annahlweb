import mongoose from 'mongoose'
import Student from '../models/studentModel.js'
import Teacher from '../models/teacherModel.js'
import User from '../models/userModel.js'

function sanitizeTeacher(teacher) {
  if (!teacher) return null
  const doc = teacher.toObject ? teacher.toObject() : teacher
  const { password, __v, _id, ...rest } = doc
  return rest
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1
}

export async function listTeachers(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }
    const teachers = await Teacher.find({}).lean()
    return res.json({ data: teachers.map(sanitizeTeacher) })
  } catch (error) {
    console.error('listTeachers error', error)
    return res.status(500).json({ message: 'Failed to list teachers' })
  }
}

export async function listStudentsByTeacher(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }
    const teacherId = req.params.id
    const students = await Student.find({ teacherId }).lean()
    return res.json({ data: students })
  } catch (error) {
    console.error('listStudentsByTeacher error', error)
    return res.status(500).json({ message: 'Failed to fetch students for teacher' })
  }
}

export async function getTeacher(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }
    const teacher = await Teacher.findOne({ id: req.params.id }).select('-password -__v').lean()
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    return res.json({ data: teacher })
  } catch (error) {
    console.error('getTeacher error', error)
    return res.status(500).json({ message: 'Failed to fetch teacher' })
  }
}

export async function createTeacher(req, res) {
  const {
    id,
    username,
    name,
    email,
    phone,
    photoUrl,
    joinedDate,
    position,
    department,
    address,
    education,
    subject,
    assignedClass,
    password,
  } = req.body || {}

  if (!id || !username || !name || !subject || !password) {
    return res.status(400).json({ message: 'Missing required teacher fields' })
  }

  if (!isMongoConnected()) {
    return res.status(503).json({ message: 'MongoDB not connected' })
  }

  try {
    const existing = await Teacher.findOne({ $or: [{ id }, { username }, ...(email ? [{ email }] : [])] })
    if (existing) {
      return res.status(409).json({ message: 'Teacher ID, username, or email already exists' })
    }

    const teacher = new Teacher({
      id,
      username,
      name,
      role: 'teacher',
      email: email || `${username}@teacher.local`,
      phone,
      photoUrl,
      joinedDate,
      position,
      department,
      address,
      education,
      subject,
      assignedClass,
      password,
    })

    const created = await teacher.save()

    await User.findOneAndUpdate(
      { username },
      {
        username,
        email: email || `${username}@teacher.local`,
        password,
        role: 'teacher',
        name,
        active: true,
        profilePhoto: photoUrl || '',
      },
      { upsert: true, new: true },
    )

    return res.status(201).json({ data: sanitizeTeacher(created) })
  } catch (error) {
    console.error('createTeacher error', error)
    return res.status(500).json({ message: 'Failed to create teacher' })
  }
}

export async function updateTeacherController(req, res) {
  try {
    const updates = req.body || {}
    updates.updatedAt = new Date()

    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }
    const updated = await Teacher.findOneAndUpdate({ id: req.params.id }, updates, {
      new: true,
      runValidators: true,
    }).lean()
    if (!updated) return res.status(404).json({ message: 'Teacher not found' })

    await User.findOneAndUpdate(
      { username: updated.username || updated.id },
      {
        username: updated.username || updated.id,
        email: updated.email,
        password: updated.password,
        role: 'teacher',
        name: updated.name,
        active: updated.active !== false,
        profilePhoto: updated.photoUrl || '',
      },
      { upsert: true, new: true },
    )

    return res.json({ data: sanitizeTeacher(updated) })
  } catch (error) {
    console.error('updateTeacherController error', error)
    return res.status(500).json({ message: 'Failed to update teacher' })
  }
}

export async function deleteTeacherController(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }

    const deleted = await Teacher.findOneAndDelete({ id: req.params.id })
    if (!deleted) return res.status(404).json({ message: 'Teacher not found' })

    await User.findOneAndDelete({ username: deleted.username || deleted.id })

    return res.status(204).end()
  } catch (error) {
    console.error('deleteTeacherController error', error)
    return res.status(500).json({ message: 'Failed to delete teacher' })
  }
}
