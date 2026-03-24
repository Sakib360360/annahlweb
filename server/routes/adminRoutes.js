import express from 'express'
import {
	createAdmin,
	deleteAdmin,
	listAdmins,
	toggleAdminStatus,
	updateAdmin,
} from '../controllers/adminController.js'
import { getTeacherPerformance } from '../controllers/progressController.js'
import { requireRoles } from '../middleware/requireRoles.js'

const router = express.Router()

router.get('/', listAdmins)
router.get('/teacher-performance', getTeacherPerformance)
router.post('/', requireRoles('management'), createAdmin)
router.put('/:id', requireRoles('management'), updateAdmin)
router.delete('/:id', requireRoles('management'), deleteAdmin)
router.patch('/:id/status', requireRoles('management'), toggleAdminStatus)

export default router
