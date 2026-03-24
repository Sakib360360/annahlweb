import express from 'express'
import { createNotice, deleteNotice, listNotices, updateNotice } from '../controllers/noticeController.js'
import { requireRoles } from '../middleware/requireRoles.js'

const router = express.Router()

router.get('/', listNotices)
router.post('/', requireRoles('management', 'admin'), createNotice)
router.put('/:id', requireRoles('management', 'admin'), updateNotice)
router.delete('/:id', requireRoles('management', 'admin'), deleteNotice)

export default router
