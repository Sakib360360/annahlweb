import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import Admin from './models/adminModel.js'

const app = express()

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://saakibabrar_db_user_nahlweb:j1e7LynqW0ijWi7K@cluster0.fcoywyu.mongodb.net/anahl?appName=Cluster0&retryWrites=true&w=majority&tls=true'

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
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
          name: 'Fatima Sultana',
          title: 'Principal',
          email: 'fatima.sultana@annahlacademy.edu',
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
    console.warn('Continuing without MongoDB; fallback to in-memory data store active.')
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
app.listen(PORT, () => {
  console.log(`An Nahl Academy API running at http://localhost:${PORT}`)
})
