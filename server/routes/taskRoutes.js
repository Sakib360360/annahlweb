import express from 'express'
import { addTaskComment, createTask, listTasks, updateTask } from '../controllers/taskController.js'
import { requireRoles } from '../middleware/requireRoles.js'

const router = express.Router()

router.get('/', listTasks)
router.post('/', requireRoles('management', 'admin'), createTask)
router.put('/:id', requireRoles('management', 'admin'), updateTask)
router.post('/:id/comments', requireRoles('management', 'admin'), addTaskComment)

export default router