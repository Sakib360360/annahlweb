import express from 'express'
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudentController,
  deleteStudentController,
  assignTeacher,
} from '../controllers/studentController.js'

const router = express.Router()

router.get('/', listStudents)
router.get('/:id', getStudent)
router.post('/', createStudent)
router.put('/:id', updateStudentController)
router.delete('/:id', deleteStudentController)
router.put('/:id/assign', assignTeacher)

export default router
