import mongoose from 'mongoose'
import Student from '../models/studentModel.js'
import {
  addTeacher,
  deleteTeacher,
  getAllTeachers,
  getAllStudents,
  getTeacherById,
  updateTeacher,
} from '../models/dataStore.js'

export function listTeachers(req, res) {
  return res.json({ data: getAllTeachers() })
}

export async function listStudentsByTeacher(req, res) {
  try {
    const teacherId = req.params.id
    if (mongoose.connection.readyState === 1) {
      const students = await Student.find({ teacherId }).lean()
      return res.json({ data: students })
    }

    const students = getAllStudents().filter((s) => s.teacherId === teacherId)
    return res.json({ data: students })
  } catch (error) {
    console.error('listStudentsByTeacher error', error)
    return res.status(500).json({ message: 'Failed to fetch students for teacher' })
  }
}

export function getTeacher(req, res) {
  const teacher = getTeacherById(req.params.id)
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
  return res.json({ data: teacher })
}

export function createTeacher(req, res) {
  const { id, name, email, subject, password } = req.body || {}
  if (!id || !name || !email || !subject || !password) {
    return res.status(400).json({ message: 'Missing required teacher fields' })
  }

  const existing = getTeacherById(id)
  if (existing) {
    return res.status(409).json({ message: 'Teacher ID already exists' })
  }

  const teacher = {
    id,
    name,
    role: 'teacher',
    subject,
    email,
    password,
  }

  const created = addTeacher(teacher)
  return res.status(201).json({ data: created })
}

export function updateTeacherController(req, res) {
  const updates = req.body || {}
  const updated = updateTeacher(req.params.id, updates)
  if (!updated) return res.status(404).json({ message: 'Teacher not found' })
  return res.json({ data: updated })
}

export function deleteTeacherController(req, res) {
  const deleted = deleteTeacher(req.params.id)
  if (!deleted) return res.status(404).json({ message: 'Teacher not found' })
  return res.status(204).end()
}
