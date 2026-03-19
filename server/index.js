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

const sanitizeUser = (user) => {
  const { password, ...rest } = user || {}
  return rest
}

app.get('/api/admins', (req, res) => {
  res.json({ data: admins.map(sanitizeUser) })
})

app.get('/api/students/:id', (req, res) => {
  const student = students.find((s) => s.id === req.params.id)
  if (!student) return res.status(404).json({ message: 'Student not found' })
  res.json({ data: sanitizeUser(student) })
})

app.post('/api/students', (req, res) => {
  const { id, name, email, grade, password } = req.body || {}
  if (!id || !name || !email || !grade || !password) {
    return res.status(400).json({ message: 'Missing required student fields' })
  }
  if (students.some((s) => s.id === id)) {
    return res.status(409).json({ message: 'Student ID already exists' })
  }

  const newStudent = {
    id,
    name,
    role: 'student',
    grade,
    email,
    password,
  }
  students.push(newStudent)
  res.status(201).json({ data: sanitizeUser(newStudent) })
})

app.put('/api/students/:id', (req, res) => {
  const student = students.find((s) => s.id === req.params.id)
  if (!student) return res.status(404).json({ message: 'Student not found' })

  const { name, email, grade, password, teacherId } = req.body || {}
  if (name) student.name = name
  if (email) student.email = email
  if (grade) student.grade = grade
  if (password) student.password = password
  if (typeof teacherId !== 'undefined') student.teacherId = teacherId

  res.json({ data: sanitizeUser(student) })
})

app.delete('/api/students/:id', (req, res) => {
  const index = students.findIndex((s) => s.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Student not found' })
  students.splice(index, 1)
  res.status(204).end()
})

app.put('/api/students/:id/assign', (req, res) => {
  const student = students.find((s) => s.id === req.params.id)
  if (!student) return res.status(404).json({ message: 'Student not found' })

  const { teacherId } = req.body || {}
  if (!teacherId) return res.status(400).json({ message: 'teacherId is required' })

  const teacher = teachers.find((t) => t.id === teacherId)
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })

  student.teacherId = teacherId
  res.json({ data: sanitizeUser(student) })
})

app.get('/api/teachers/:id/students', (req, res) => {
  const teacher = teachers.find((t) => t.id === req.params.id)
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })

  const assigned = students.filter((s) => s.teacherId === teacher.id)
  res.json({ data: assigned.map(sanitizeUser) })
})

app.get('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find((t) => t.id === req.params.id)
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
  res.json({ data: sanitizeUser(teacher) })
})

app.post('/api/teachers', (req, res) => {
  const { id, name, email, subject, password } = req.body || {}
  if (!id || !name || !email || !subject || !password) {
    return res.status(400).json({ message: 'Missing required teacher fields' })
  }
  if (teachers.some((t) => t.id === id)) {
    return res.status(409).json({ message: 'Teacher ID already exists' })
  }

  const newTeacher = {
    id,
    name,
    role: 'teacher',
    subject,
    email,
    password,
  }
  teachers.push(newTeacher)
  res.status(201).json({ data: sanitizeUser(newTeacher) })
})

app.put('/api/teachers/:id', (req, res) => {
  const teacher = teachers.find((t) => t.id === req.params.id)
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' })

  const { name, email, subject, password } = req.body || {}
  if (name) teacher.name = name
  if (email) teacher.email = email
  if (subject) teacher.subject = subject
  if (password) teacher.password = password

  res.json({ data: sanitizeUser(teacher) })
})

app.delete('/api/teachers/:id', (req, res) => {
  const index = teachers.findIndex((t) => t.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Teacher not found' })
  teachers.splice(index, 1)
  res.status(204).end()
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

  const userSafe = sanitizeUser(user)
  return res.json({ user: userSafe, token: 'fake-jwt-token' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`An Nahl Academy API running at http://localhost:${PORT}`)
})
