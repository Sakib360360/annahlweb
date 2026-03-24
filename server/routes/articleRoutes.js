import express from 'express'
import { createArticle, deleteArticle, listArticles, updateArticle } from '../controllers/articleController.js'
import { requireRoles } from '../middleware/requireRoles.js'

const router = express.Router()

router.get('/', listArticles)
router.post('/', requireRoles('management', 'admin', 'teacher'), createArticle)
router.put('/:id', requireRoles('management', 'admin', 'teacher'), updateArticle)
router.delete('/:id', requireRoles('management', 'admin'), deleteArticle)

export default router
