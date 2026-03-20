import express from 'express'
import {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacherController,
  deleteTeacherController,
  listStudentsByTeacher,
} from '../controllers/teacherController.js'
import { getStudentProgress, upsertStudentProgress } from '../controllers/progressController.js'

const router = express.Router()

router.get('/', listTeachers)
router.get('/:id', getTeacher)
router.post('/', createTeacher)
router.put('/:id', updateTeacherController)
router.delete('/:id', deleteTeacherController)
router.get('/:id/students', listStudentsByTeacher)
router.get('/:id/students/:studentId/progress', getStudentProgress)
router.put('/:id/students/:studentId/progress', upsertStudentProgress)

export default router
