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

function countCompletedWeeks(apProgress) {
  const weeks = apProgress?.weeks || []
  return weeks.reduce((count, week) => {
    const hasEntry = (week.days || []).some((day) => day && day.subjects && Object.keys(day.subjects).length > 0)
    return count + (hasEntry ? 1 : 0)
  }, 0)
}

export async function getTeacherPerformance(req, res) {
  try {
    ensureMongo()
    const teachers = await Teacher.find({}).lean()

    const performance = await Promise.all(
      teachers.map(async (teacher) => {
        const students = await Student.find({ teacherId: teacher.id }).lean()
        const studentProgress = await Promise.all(
          students.map(async (student) => {
            const prog = await StudentProgress.findOne({ teacherId: teacher.id, studentId: student.id }).lean()
            return { studentId: student.id, prog }
          }),
        )

        const APS = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']
        const apScores = APS.map((ap) => {
          const totalWeeksCompleted = studentProgress.reduce((sum, { prog }) => {
            if (!prog || !prog.ap || !prog.ap[ap]) return sum
            return sum + countCompletedWeeks(prog.ap[ap])
          }, 0)

          const expectedWeeks = 6 * students.length
          const percentage = expectedWeeks ? totalWeeksCompleted / expectedWeeks : 0
          const points = Math.round(percentage * 100)
          return { ap, points }
        })

        const totalPoints = Math.round(apScores.reduce((sum, item) => sum + item.points, 0) / APS.length)

        const today = new Date()
        const dayIndex = ((today.getDay() + 6) % 7) - 1 // Mon=0..Sat=5 (approx)
        const weekIndex = Math.min(5, Math.floor((today.getDate() - 1) / 7))

        const missedToday = studentProgress.some(({ prog }) => {
          if (!prog) return true
          const todayProgress = APS.some((ap) => {
            const week = prog.ap?.[ap]?.weeks?.[weekIndex]
            if (!week) return true
            const day = week.days?.[dayIndex]
            return !(day && day.subjects && Object.keys(day.subjects).length > 0)
          })
          return todayProgress
        })

        return {
          teacherId: teacher.id,
          name: teacher.name,
          apScores,
          totalPoints,
          missedToday,
          studentsCount: students.length,
        }
      }),
    )

    return res.json({ data: performance })
  } catch (error) {
    console.error('getTeacherPerformance error', error)
    return res.status(500).json({ message: 'Failed to fetch teacher performance' })
  }
}
