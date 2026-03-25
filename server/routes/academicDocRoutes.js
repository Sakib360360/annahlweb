import express from 'express'
import { listAcademicDocs, upsertAcademicDoc } from '../controllers/academicDocController.js'
import { requireRoles } from '../middleware/requireRoles.js'

const router = express.Router()

router.get('/', listAcademicDocs)
router.put('/', requireRoles('management', 'admin'), upsertAcademicDoc)

export default router
