import express from 'express'
import { addTaskComment, createTask, listTasks, updateTask } from '../controllers/taskController.js'

const router = express.Router()

router.get('/', listTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.post('/:id/comments', addTaskComment)

export default router