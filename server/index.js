import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadJson(filename) {
  const raw = fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8')
  return JSON.parse(raw)
}

const students = loadJson('students.json')
const teachers = loadJson('teachers.json')
const admins = loadJson('admins.json')

const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'An Nahl Academy API is running' })
})

app.get('/api/students', (req, res) => {
  res.json({ data: students.map(({ password, ...rest }) => rest) })
})

app.get('/api/teachers', (req, res) => {
  res.json({ data: teachers.map(({ password, ...rest }) => rest) })
})

app.get('/api/admins', (req, res) => {
  res.json({ data: admins.map(({ password, ...rest }) => rest) })
})

app.post('/api/login', (req, res) => {
  const { id, password, email } = req.body || {}

  if ((!id && !email) || !password) {
    return res.status(400).json({ message: 'ID (or email) and password are required' })
  }

  const credentialsMatch = (user) => {
    if (!user) return false
    if (user.password !== password) return false
    if (id && user.id === id) return true
    if (email && user.email === email) return true
    return false
  }

  const allUsers = [...admins, ...teachers, ...students]
  const user = allUsers.find(credentialsMatch)

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const { password: _pass, ...userSafe } = user
  return res.json({ user: userSafe, token: 'fake-jwt-token' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`An Nahl Academy API running at http://localhost:${PORT}`)
})
