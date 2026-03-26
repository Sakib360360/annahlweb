import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import academicDocRoutes from './routes/academicDocRoutes.js'

const app = express()

const { MONGODB_URI } = process.env

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required. Set it in environment variables for local and production.')
}

const MONGO_CONNECTION_URI = MONGODB_URI

console.log('Mongo connection URI in use:', MONGO_CONNECTION_URI.replace(/(mongodb\+srv:\/\/.*?:).*?@/, '$1***@'))

let mongoConnectPromise = null

async function ensureMongoConnection() {
  if (mongoose.connection.readyState === 1) return

  if (!mongoConnectPromise) {
    mongoConnectPromise = mongoose
      .connect(MONGO_CONNECTION_URI)
      .then(() => {
        console.log('MongoDB connected successfully')
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error)
        mongoConnectPromise = null
        throw error
      })
  }

  await mongoConnectPromise
}

ensureMongoConnection().catch(() => {
  if (!process.env.VERCEL) {
    console.error('MongoDB is required; shutting down to avoid in-memory fallback data loss.')
    process.exit(1)
  }
})

app.use(cors({ origin: true }))
app.use(express.json())

app.use(async (req, res, next) => {
  try {
    await ensureMongoConnection()
    next()
  } catch {
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'An Nahl Academy API is running' })
})

app.use('/api', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/admins', adminRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/academic-docs', academicDocRoutes)

const PORT = process.env.PORT || 5001

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`An Nahl Academy API running at http://localhost:${PORT}`)
  })
}

export default app
