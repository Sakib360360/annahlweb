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
import { requireRoles } from '../middleware/requireRoles.js'

const router = express.Router()

router.get('/', listTeachers)
router.get('/:id', getTeacher)
router.post('/', requireRoles('admin'), createTeacher)
router.put('/:id', requireRoles('admin'), updateTeacherController)
router.delete('/:id', requireRoles('admin'), deleteTeacherController)
router.get('/:id/students', listStudentsByTeacher)
router.get('/:id/students/:studentId/progress', getStudentProgress)
router.put('/:id/students/:studentId/progress', requireRoles('teacher'), upsertStudentProgress)

export default router
