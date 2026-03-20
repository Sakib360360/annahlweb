import mongoose from 'mongoose'
import Student from '../models/studentModel.js'
import {
  addStudent as addStudentMemory,
  deleteStudent as deleteStudentMemory,
  getAllStudents as getAllStudentsMemory,
  getStudentById as getStudentByIdMemory,
  updateStudent as updateStudentMemory,
  assignStudentToTeacher as assignStudentToTeacherMemory,
} from '../models/dataStore.js'

function sanitizeStudent(student) {
  if (!student) return null
  const doc = student.toObject ? student.toObject() : student
  const { password, __v, _id, ...rest } = doc
  return rest
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1
}

export async function listStudents(req, res) {
  try {
    const filter = {}

    if (req.query.grade) {
      filter.grade = req.query.grade
    }

    if (req.query.teacherId) {
      filter.teacherId = req.query.teacherId
    }

    if (isMongoConnected()) {
      const students = await Student.find(filter).lean()
      return res.json({ data: students.map((s) => ({ ...s, role: 'student' })) })
    }

    const students = getAllStudentsMemory().filter((student) => {
      if (filter.grade && student.grade !== filter.grade) return false
      if (filter.teacherId && student.teacherId !== filter.teacherId) return false
      return true
    })
    return res.json({ data: students })
  } catch (error) {
    console.error('listStudents error', error)
    return res.status(500).json({ message: 'Failed to list students' })
  }
}

export async function getStudent(req, res) {
  try {
    if (isMongoConnected()) {
      const student = await Student.findOne({ id: req.params.id }).select('-password -__v').lean()
      if (!student) return res.status(404).json({ message: 'Student not found' })
      return res.json({ data: student })
    }

    const student = getStudentByIdMemory(req.params.id)
    if (!student) return res.status(404).json({ message: 'Student not found' })
    return res.json({ data: student })
  } catch (error) {
    console.error('getStudent error', error)
    return res.status(500).json({ message: 'Failed to fetch student' })
  }
}

export async function createStudent(req, res) {
  const { id, name, email, grade, password, phone, sessionAdmitted, teacherId } = req.body || {}
  if (!id || !name || !email || !grade || !password) {
    return res.status(400).json({ message: 'Missing required student fields' })
  }

  try {
    if (isMongoConnected()) {
      const existing = await Student.findOne({ $or: [{ id }, { email }] })
      if (existing) {
        return res.status(409).json({ message: 'Student ID or email already exists' })
      }

      const student = new Student({
        id,
        name,
        role: 'student',
        grade,
        email,
        phone,
        sessionAdmitted,
        password,
        teacherId: teacherId || null,
      })

      const created = await student.save()
      return res.status(201).json({ data: sanitizeStudent(created) })
    }

    const existing = getStudentByIdMemory(id)
    if (existing) {
      return res.status(409).json({ message: 'Student ID already exists' })
    }

    const student = {
      id,
      name,
      role: 'student',
      grade,
      email,
      phone,
      sessionAdmitted,
      password,
      teacherId: teacherId || null,
    }

    const created = addStudentMemory(student)
    return res.status(201).json({ data: created })
  } catch (error) {
    console.error('createStudent error', error)
    return res.status(500).json({ message: 'Failed to create student' })
  }
}


export async function updateStudentController(req, res) {
  try {
    const updates = req.body || {}
    updates.updatedAt = new Date()

    if (isMongoConnected()) {
      const updated = await Student.findOneAndUpdate({ id: req.params.id }, updates, {
        new: true,
        runValidators: true,
      }).lean()
      if (!updated) return res.status(404).json({ message: 'Student not found' })
      return res.json({ data: sanitizeStudent(updated) })
    }

    const updated = updateStudentMemory(req.params.id, updates)
    if (!updated) return res.status(404).json({ message: 'Student not found' })
    return res.json({ data: updated })
  } catch (error) {
    console.error('updateStudentController error', error)
    return res.status(500).json({ message: 'Failed to update student' })
  }
}

export async function deleteStudentController(req, res) {
  try {
    if (isMongoConnected()) {
      const deleted = await Student.findOneAndDelete({ id: req.params.id })
      if (!deleted) return res.status(404).json({ message: 'Student not found' })
      return res.status(204).end()
    }

    const deleted = deleteStudentMemory(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Student not found' })
    return res.status(204).end()
  } catch (error) {
    console.error('deleteStudentController error', error)
    return res.status(500).json({ message: 'Failed to delete student' })
  }
}

export async function assignTeacher(req, res) {
  const { teacherId } = req.body || {}
  if (!teacherId) return res.status(400).json({ message: 'teacherId is required' })

  try {
    if (isMongoConnected()) {
      const student = await Student.findOneAndUpdate(
        { id: req.params.id },
        { teacherId, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).lean()
      if (!student) return res.status(404).json({ message: 'Student not found' })
      return res.json({ data: sanitizeStudent(student) })
    }

    const student = assignStudentToTeacherMemory(req.params.id, teacherId)
    if (!student) return res.status(404).json({ message: 'Student not found' })
    return res.json({ data: student })
  } catch (error) {
    console.error('assignTeacher error', error)
    return res.status(500).json({ message: 'Failed to assign teacher to student' })
  }
}
