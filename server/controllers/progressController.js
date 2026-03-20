import mongoose from 'mongoose'
import Student from '../models/studentModel.js'
import Teacher from '../models/teacherModel.js'
import StudentProgress from '../models/studentProgressModel.js'

function ensureMongo() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is required for progress APIs')
  }
}

export async function getStudentProgress(req, res) {
  try {
    ensureMongo()
    const { studentId } = req.params

    const student = await Student.findOne({ id: studentId }).lean()
    if (!student) return res.status(404).json({ message: 'Student not found' })
    if (!student.teacherId) return res.status(404).json({ message: 'Student has no assigned teacher' })

    const progress = await StudentProgress.findOne({ teacherId: student.teacherId, studentId }).lean()
    if (!progress) return res.json({ data: { teacherId: student.teacherId, studentId, ap: {}, messages: [] } })

    return res.json({ data: progress })
  } catch (error) {
    console.error('getStudentProgress error', error)
    return res.status(500).json({ message: error.message || 'Failed to fetch student progress' })
  }
}

export async function upsertStudentProgress(req, res) {
  try {
    ensureMongo()
    const { teacherId, studentId } = req.params
    const { ap, messages } = req.body || {}

    const teacher = await Teacher.findOne({ id: teacherId }).lean()
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })

    const student = await Student.findOne({ id: studentId }).lean()
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const updated = await StudentProgress.findOneAndUpdate(
      { teacherId, studentId },
      {
        teacherId,
        studentId,
        ap: ap ?? {},
        messages: messages ?? [],
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean()

    return res.json({ data: updated })
  } catch (error) {
    console.error('upsertStudentProgress error', error)
    return res.status(500).json({ message: error.message || 'Failed to update student progress' })
  }
}
