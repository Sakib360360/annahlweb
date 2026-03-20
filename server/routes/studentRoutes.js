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

const router = express.Router()

router.get('/', listStudents)
router.get('/:id', getStudent)
router.get('/:id/progress', getStudentProgress)
router.post('/', createStudent)
router.put('/:id', updateStudentController)
router.delete('/:id', deleteStudentController)
router.put('/:id/assign', assignTeacher)

export default router
