import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import Admin from './models/adminModel.js'

const app = express()

const { MONGODB_URI } = process.env

// use a stable DB name so data persists explicitly, not test db
const defaultUri = 'mongodb+srv://saakibabrar_db_user_nahlweb:j1e7LynqW0ijWi7K@cluster0.fcoywyu.mongodb.net/anahl?retryWrites=true&w=majority'

const MONGO_CONNECTION_URI = MONGODB_URI || defaultUri

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set in env. Using default hardcoded DB URI (mongo db: anahl).')
}

console.log('Mongo connection URI in use:', MONGO_CONNECTION_URI.replace(/(mongodb\+srv:\/\/.*?:).*?@/, '$1***@'))

mongoose
  .connect(MONGO_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB connected successfully')

    // Ensure default admin exists to support a1 / a123 credentials
    try {
      await Admin.findOneAndUpdate(
        { id: 'a1' },
        {
          id: 'a1',
          role: 'admin',
          name: 'Dr. Abul Kalam Azad',
          title: 'Principal',
          email: 'official.annahlacademy@gmail.com',
          password: 'a123',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      console.log('Default admin a1 / a123 ensured in MongoDB')
    } catch (err) {
      console.error('Failed to ensure default admin in MongoDB', err)
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    console.error('MongoDB is required; shutting down to avoid in-memory fallback data loss.')
    process.exit(1)
  })

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'An Nahl Academy API is running' })
})

app.use('/api', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/admins', adminRoutes)

const PORT = process.env.PORT || 5001

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`An Nahl Academy API running at http://localhost:${PORT}`)
  })
}

export default app
