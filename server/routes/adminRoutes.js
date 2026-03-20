import express from 'express'
import { listAdmins } from '../controllers/adminController.js'
import { getTeacherPerformance } from '../controllers/progressController.js'

const router = express.Router()

router.get('/', listAdmins)
router.get('/teacher-performance', getTeacherPerformance)

export default router
