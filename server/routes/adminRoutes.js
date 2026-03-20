import express from 'express'
import { listAdmins } from '../controllers/adminController.js'

const router = express.Router()

router.get('/', listAdmins)

export default router
