import express from 'express'
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudentController,
  deleteStudentController,
  assignTeacher,
} from '../controllers/studentController.js'
import { getStudentProgress } from '../controllers/progressController.js'
import { requireRoles } from '../middleware/requireRoles.js'

const router = express.Router()

router.get('/', listStudents)
router.get('/:id', getStudent)
router.get('/:id/progress', getStudentProgress)
router.post('/', requireRoles('admin'), createStudent)
router.put('/:id', requireRoles('admin'), updateStudentController)
router.delete('/:id', requireRoles('admin'), deleteStudentController)
router.put('/:id/assign', requireRoles('admin'), assignTeacher)

export default router
