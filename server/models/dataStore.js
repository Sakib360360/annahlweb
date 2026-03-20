import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '..', 'data')

function loadJson(filename) {
  const raw = fs.readFileSync(path.join(dataDir, filename), 'utf8')
  return JSON.parse(raw)
}

function sanitizeUser(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

// In-memory data store (for dummy data). Replace with a real DB (MongoDB, etc.) later.
const students = loadJson('students.json')
const teachers = loadJson('teachers.json')
const admins = loadJson('admins.json')

export const dataStore = {
  students,
  teachers,
  admins,
  sanitizeUser,
}

export function findUserById(id) {
  return [...admins, ...teachers, ...students].find((u) => u.id === id)
}

export function findUserByEmail(email) {
  return [...admins, ...teachers, ...students].find((u) => u.email === email)
}

export function getAllStudents() {
  return students.map(sanitizeUser)
}

export function getStudentById(id) {
  const student = students.find((s) => s.id === id)
  return sanitizeUser(student)
}

export function addStudent(student) {
  students.push(student)
  return sanitizeUser(student)
}

export function updateStudent(id, updates) {
  const student = students.find((s) => s.id === id)
  if (!student) return null
  Object.assign(student, updates)
  return sanitizeUser(student)
}

export function deleteStudent(id) {
  const idx = students.findIndex((s) => s.id === id)
  if (idx === -1) return false
  students.splice(idx, 1)
  return true
}

export function getAllTeachers() {
  return teachers.map(sanitizeUser)
}

export function getTeacherById(id) {
  const teacher = teachers.find((t) => t.id === id)
  return sanitizeUser(teacher)
}

export function addTeacher(teacher) {
  teachers.push(teacher)
  return sanitizeUser(teacher)
}

export function updateTeacher(id, updates) {
  const teacher = teachers.find((t) => t.id === id)
  if (!teacher) return null
  Object.assign(teacher, updates)
  return sanitizeUser(teacher)
}

export function deleteTeacher(id) {
  const idx = teachers.findIndex((t) => t.id === id)
  if (idx === -1) return false
  teachers.splice(idx, 1)
  return true
}

export function getAllAdmins() {
  return admins.map(sanitizeUser)
}

export function getAdminById(id) {
  const admin = admins.find((a) => a.id === id)
  return sanitizeUser(admin)
}

export function verifyCredentials({ id, email, password }) {
  if ((!id && !email) || !password) return null

  const candidate = findUserById(id) || findUserByEmail(email)
  if (!candidate) return null
  if (candidate.password !== password) return null
  return sanitizeUser(candidate)
}

export function assignStudentToTeacher(studentId, teacherId) {
  const student = students.find((s) => s.id === studentId)
  if (!student) return null
  const teacher = teachers.find((t) => t.id === teacherId)
  if (!teacher) return null
  student.teacherId = teacherId
  return sanitizeUser(student)
}

export function getStudentsForTeacher(teacherId) {
  return students.filter((s) => s.teacherId === teacherId).map(sanitizeUser)
}

// For future MongoDB integration:
// export function connectToDatabase(uri) { ... }
// export const StudentModel = mongoose.model('Student', studentSchema)
