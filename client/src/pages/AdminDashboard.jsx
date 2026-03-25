import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getFromStorage } from '../utils/localStorage'
import {
  assignStudentToTeacher,
  createStudent,
  createTeacher,
  deleteStudent,
  deleteTeacher,
  fetchAdmins,
  fetchAcademicDocs,
  fetchStudents,
  fetchTeachers,
  fetchTeacherPerformance,
  fetchTasks,
  updateStudent,
  updateTask,
  updateTeacher,
  upsertAcademicDoc,
} from '../services/api'

const YEAR_GROUP_OPTIONS = [
  'Nursery',
  'Reception',
  'Year 1BG',
  'Year 2B',
  'Year 2G',
  'Year 3B',
  'Year 3G',
  'Year 4B',
  'Year 4G',
  'Year 5B',
  'Year 5G',
  'Year 6B',
  'Year 6G',
  'Year 7B',
  'Year 7G',
  'Year 8B',
  'Year 8G',
  'Year 9B',
  'Year 9G',
]

const SESSION_OPTIONS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027']
const AP_OPTIONS = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']

const GRADE_TO_GROUP = (grade) => {
  if (!grade) return 'Unknown'
  const normalized = grade.toString().trim()
  if (YEAR_GROUP_OPTIONS.includes(normalized)) return normalized
  if (/^\d+$/.test(normalized)) return `Year ${normalized}`
  if (/^Year\s*\d+/i.test(normalized)) return normalized
  return 'Unknown'
}

const getTeacherStudentStorageKey = (teacherId, studentId) => `anahl:teacher:${teacherId}:student:${studentId}`

const computeCompletion = (teacher, assignedStudents) => {
  if (!assignedStudents.length) return 0
  const completed = assignedStudents.filter((student) => {
    const data = getFromStorage(getTeacherStudentStorageKey(teacher.id, student.id), null)
    return data && Array.isArray(data.dailyGrades) && data.dailyGrades.some((grade) => grade)
  }).length
  return Math.round((completed / assignedStudents.length) * 100)
}

const TASK_STATUSES = ['Pending', 'Ongoing', 'In Progress', 'Completed', 'Done']

const TASK_PRIORITY_STYLE = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
}

const TASK_STATUS_STYLE = {
  Pending: 'bg-slate-100 text-slate-700 border-slate-200',
  Ongoing: 'bg-amber-100 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [teacherPerformance, setTeacherPerformance] = useState([])
  const [admins, setAdmins] = useState([])
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [taskError, setTaskError] = useState('')
  const [taskFilterStatus, setTaskFilterStatus] = useState('All')
  const [activeTab, setActiveTab] = useState('operations')

  // Documents (LTP / MTP) state
  const [academicDocs, setAcademicDocs] = useState([])
  const [ltpSession, setLtpSession] = useState('2024-2025')
  const [ltpLink, setLtpLink] = useState('')
  const [mtpSession, setMtpSession] = useState('2024-2025')
  const [mtpAp, setMtpAp] = useState('AP1')
  const [mtpLink, setMtpLink] = useState('')
  const [docSaving, setDocSaving] = useState(false)
  const [docMsg, setDocMsg] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [studentForm, setStudentForm] = useState({ id: '', name: '', email: '', grade: 'Nursery', phone: '', sessionAdmitted: '2024-2025', password: '' })
  const [teacherForm, setTeacherForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
    joinedDate: '',
    position: '',
    department: '',
    address: '',
    education: '',
    subject: '',
    password: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }

    fetchStudents().then(setStudents).catch(() => setStudents([]))
    fetchTeachers().then(setTeachers).catch(() => setTeachers([]))
    fetchTeacherPerformance().then(setTeacherPerformance).catch(() => setTeacherPerformance([]))
    fetchAdmins().then(setAdmins).catch(() => setAdmins([]))
    fetchAcademicDocs().then(setAcademicDocs).catch(() => setAcademicDocs([]))

    setTasksLoading(true)
    fetchTasks()
      .then((data) => {
        setTasks(data || [])
        setTaskError('')
      })
      .catch((err) => {
        setTaskError(err?.message || 'Failed to load tasks')
        setTasks([])
      })
      .finally(() => setTasksLoading(false))
  }, [user, navigate])

  const myAdminProfile = useMemo(() => {
    if (!user) return null
    return admins.find((admin) => {
      if (user.id && admin.id === user.id) return true
      if (user.username && admin.username === user.username) return true
      if (user.email && admin.email && admin.email === user.email) return true
      return false
    }) || null
  }, [admins, user])

  const assigneeKeys = useMemo(() => {
    const keys = new Set()
    if (user?.id) keys.add(user.id)
    if (user?.username) keys.add(user.username)
    if (user?.email) keys.add(user.email)
    if (myAdminProfile?.id) keys.add(myAdminProfile.id)
    if (myAdminProfile?.username) keys.add(myAdminProfile.username)
    return Array.from(keys).filter(Boolean)
  }, [user, myAdminProfile])

  const assignedTasks = useMemo(() => {
    const mine = tasks.filter((task) => assigneeKeys.includes(task.assignedTo))
    if (taskFilterStatus === 'All') return mine
    return mine.filter((task) => task.status === taskFilterStatus)
  }, [tasks, assigneeKeys, taskFilterStatus])

  const groupedTeachers = useMemo(() => {
    return teachers.map((teacher) => {
      const assigned = students.filter((student) => student.teacherId === teacher.id)
      return {
        ...teacher,
        assignedCount: assigned.length,
        completion: computeCompletion(teacher, assigned),
      }
    })
  }, [teachers, students])

  const studentOverviewData = useMemo(() => {
    return students.map((student) => {
      const progress = getFromStorage(`anahl:progress:${student.id}`, null)
      const total = (progress?.subjects || []).reduce((acc, subject) => {
        const subjectTotal = (subject.ap || []).reduce((sum, ap) => {
          const score = Math.round(ap.formative * 0.8 + ap.summative * 0.2)
          return sum + score
        }, 0)
        return acc + subjectTotal
      }, 0)
      const count = (progress?.subjects || []).reduce((acc, subject) => acc + (subject.ap?.length || 0), 0)
      const average = count ? Math.round(total / count) : 0
      return {
        name: student.name,
        grade: average / 25, // scale 0-4
      }
    })
  }, [students])

  const createNewStudent = async () => {
    setError('')
    if (!studentForm.id || !studentForm.name || !studentForm.email || !studentForm.grade || !studentForm.password) {
      setError('Please fill all required fields: ID, Name, Email, Grade, Password')
      return
    }
    try {
      const created = await createStudent(studentForm)
      setStudents((prev) => [...prev, created])
      setStudentForm({ id: '', name: '', email: '', grade: 'Nursery', phone: '', sessionAdmitted: '2024-2025', password: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  const updateExistingStudent = async (id) => {
    setError('')
    try {
      const updated = await updateStudent(id, studentForm)
      setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)))
      setStudentForm({ id: '', name: '', email: '', grade: '', password: '' })
      setSelectedTeacherId('')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeStudent = async (id) => {
    setError('')
    try {
      await deleteStudent(id)
      setStudents((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const createNewTeacher = async () => {
    setError('')
    if (!teacherForm.id || !teacherForm.name || !teacherForm.email || !teacherForm.subject || !teacherForm.password) {
      setError('Please fill all required fields: ID, Name, Email, Subject, Password')
      return
    }
    try {
      const created = await createTeacher(teacherForm)
      setTeachers((prev) => [...prev, created])
      setTeacherForm({
        id: '',
        name: '',
        email: '',
        phone: '',
        photoUrl: '',
        joinedDate: '',
        position: '',
        department: '',
        address: '',
        education: '',
        subject: '',
        password: '',
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const updateExistingTeacher = async (id) => {
    setError('')
    try {
      const updated = await updateTeacher(id, teacherForm)
      setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setTeacherForm({
        id: '',
        name: '',
        email: '',
        phone: '',
        photoUrl: '',
        joinedDate: '',
        position: '',
        department: '',
        address: '',
        education: '',
        subject: '',
        password: '',
      })
      setSelectedTeacherId('')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeTeacher = async (id) => {
    setError('')
    try {
      await deleteTeacher(id)
      setTeachers((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const assignStudent = async (studentId, teacherId) => {
    try {
      const updated = await assignStudentToTeacher(studentId, teacherId)
      setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)))
    } catch (err) {
      setError(err.message)
    }
  }

  const updateMyTaskStatus = async (taskId, status) => {
    setTaskError('')
    try {
      await updateTask(taskId, { status })
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status } : task)))
    } catch (err) {
      setTaskError(err?.message || 'Failed to update task status')
    }
  }

  const saveLtpLink = async () => {
    if (!ltpLink.trim()) { setDocMsg('Please enter a Google Drive link.'); return }
    setDocSaving(true); setDocMsg('')
    try {
      const saved = await upsertAcademicDoc({ type: 'LTP', session: ltpSession, link: ltpLink.trim(), uploadedBy: user?.name || '' })
      setAcademicDocs((prev) => {
        const filtered = prev.filter((d) => !(d.type === 'LTP' && d.session === ltpSession))
        return [...filtered, saved]
      })
      setLtpLink('')
      setDocMsg('LTP link saved successfully.')
    } catch (err) {
      setDocMsg(err.message)
    } finally {
      setDocSaving(false)
    }
  }

  const saveMtpLink = async () => {
    if (!mtpLink.trim()) { setDocMsg('Please enter a Google Drive link.'); return }
    setDocSaving(true); setDocMsg('')
    try {
      const saved = await upsertAcademicDoc({ type: 'MTP', session: mtpSession, ap: mtpAp, link: mtpLink.trim(), uploadedBy: user?.name || '' })
      setAcademicDocs((prev) => {
        const filtered = prev.filter((d) => !(d.type === 'MTP' && d.session === mtpSession && d.ap === mtpAp))
        return [...filtered, saved]
      })
      setMtpLink('')
      setDocMsg('MTP link saved successfully.')
    } catch (err) {
      setDocMsg(err.message)
    } finally {
      setDocSaving(false)
    }
  }

  if (!user) return null

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-brand-900">Admin Dashboard</h1>
              <p className="mt-2 text-slate-600">
                Welcome back, <span className="font-semibold text-brand-900">{user.name}</span>. Manage learners, staff, and monitor key metrics.
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="rounded-2xl border border-white/30 bg-white/70 p-2 shadow-soft backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('operations')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'operations'
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-brand-50'
              }`}
            >
              Operations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'tasks'
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-brand-50'
              }`}
            >
              My Assigned Tasks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'documents'
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-brand-50'
              }`}
            >
              MTP / LTP Docs
            </button>
          </div>
        </div>

        {activeTab === 'operations' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold text-brand-900">Student Management</h2>
                <p className="text-sm text-slate-600">Add, edit, or delete students.</p>
              </div>

              {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Add / Edit student</h3>
                  <div className="grid gap-3">
                    <input
                      value={studentForm.id}
                      onChange={(e) => setStudentForm((prev) => ({ ...prev, id: e.target.value }))}
                      placeholder="Student ID"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={studentForm.name}
                      onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={studentForm.email}
                      onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        value={studentForm.grade}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, grade: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      >
                        {YEAR_GROUP_OPTIONS.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                      <input
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        value={studentForm.sessionAdmitted}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, sessionAdmitted: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        required
                      >
                        <option value="">Select session</option>
                        {SESSION_OPTIONS.map((session) => (
                          <option key={session} value={session}>
                            {session}
                          </option>
                        ))}
                      </select>
                      <input
                        value={studentForm.password}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Password"
                        type="password"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => createNewStudent()}
                        className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                      >
                        Add student
                      </button>
                      <button
                        type="button"
                        onClick={() => updateExistingStudent(studentForm.id)}
                        className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50"
                      >
                        Update student
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Student list</h3>
                  <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Grade</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">Session</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-3 py-2 text-xs font-semibold text-slate-600">{student.id}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{student.name}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{student.grade}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{student.phone || '-'}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{student.sessionAdmitted || '-'}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">
                              <button
                                type="button"
                                onClick={() => setStudentForm({
                                  id: student.id,
                                  name: student.name,
                                  email: student.email,
                                  grade: student.grade,
                                  phone: student.phone || '',
                                  sessionAdmitted: student.sessionAdmitted || '',
                                  password: '',
                                })}
                                className="mr-2 rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeStudent(student.id)}
                                className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold text-brand-900">Teacher Management</h2>
                <p className="text-sm text-slate-600">Add teachers and assign students.</p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Add / Edit teacher</h3>
                  <div className="grid gap-3">
                    <input
                      value={teacherForm.id}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, id: e.target.value }))}
                      placeholder="Teacher ID"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.photoUrl}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, photoUrl: e.target.value }))}
                      placeholder="Photo URL"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.joinedDate}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, joinedDate: e.target.value }))}
                      placeholder="Joined Date"
                      type="date"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.position}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, position: e.target.value }))}
                      placeholder="Position"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.department}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, department: e.target.value }))}
                      placeholder="Department"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.address}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Address"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.education}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, education: e.target.value }))}
                      placeholder="Education"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Subject"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <input
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Password"
                      type="password"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => createNewTeacher()}
                        className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                      >
                        Add teacher
                      </button>
                      <button
                        type="button"
                        onClick={() => updateExistingTeacher(teacherForm.id)}
                        className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50"
                      >
                        Update teacher
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Teacher list</h3>
                  <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Subject</th>
                          <th className="px-3 py-2">Department</th>
                          <th className="px-3 py-2">Joined</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teachers.map((teacher) => (
                          <tr key={teacher.id}>
                            <td className="px-3 py-2 text-xs font-semibold text-slate-600">{teacher.id}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{teacher.name}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{teacher.subject}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{teacher.department || '-'}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{teacher.joinedDate ? new Date(teacher.joinedDate).toLocaleDateString() : '-'}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">
                              <button
                                type="button"
                                onClick={() => setTeacherForm({
                                  id: teacher.id,
                                  name: teacher.name,
                                  email: teacher.email,
                                  phone: teacher.phone || '',
                                  photoUrl: teacher.photoUrl || '',
                                  joinedDate: teacher.joinedDate ? new Date(teacher.joinedDate).toISOString().slice(0, 10) : '',
                                  position: teacher.position || '',
                                  department: teacher.department || '',
                                  address: teacher.address || '',
                                  education: teacher.education || '',
                                  subject: teacher.subject || '',
                                  password: '',
                                })}
                                className="mr-2 rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTeacher(teacher.id)}
                                className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <h2 className="text-xl font-semibold text-brand-900">Assign Students</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a teacher, then pick which students to assign.</p>

              <div className="mt-5 grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.subject})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTeacherId && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Toggle students to assign to this teacher.</p>
                    <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white p-3">
                      {students.map((student) => {
                        const assigned = student.teacherId === selectedTeacherId
                        return (
                          <label key={student.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-slate-50">
                            <span className="flex-1 text-sm text-slate-700">
                              {student.name} <span className="text-xs text-slate-500">(Grade {student.grade})</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={assigned}
                              onChange={() => assignStudent(student.id, assigned ? '' : selectedTeacherId)}
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <h2 className="text-xl font-semibold text-brand-900">Performance Overview</h2>
              <p className="mt-1 text-sm text-slate-600">Track grading completion and student progress at a glance.</p>

              <div className="mt-8 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-700">Teacher grading completion</h3>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupedTeachers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completion" name="Completion %" fill="#14b8a6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-700">Student progress snapshot</h3>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentOverviewData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 4]} />
                        <Tooltip />
                        <Bar dataKey="grade" name="Avg grade" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-700">Teacher performance insights</h3>
                  <p className="mt-1 text-xs text-slate-500">Each teacher starts with 100 points per AP for 6 weeks. Missing daily updates incur point reduction.</p>
                  <div className="mt-4 overflow-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead>
                        <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <th className="px-3 py-2">Teacher</th>
                          <th className="px-3 py-2">Total</th>
                          <th className="px-3 py-2">Missed Today</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherPerformance.map((t) => (
                          <tr key={t.teacherId} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2">{t.name}</td>
                            <td className="px-3 py-2 font-semibold">{t.totalPoints}</td>
                            <td className={`px-3 py-2 font-semibold ${t.missedToday ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {t.missedToday ? 'Missing update' : 'On track'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        )}

        {activeTab === 'tasks' && (
          <section className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-brand-900">My Assigned Tasks</h2>
                <p className="mt-1 text-sm text-slate-600">Tasks assigned by management to your account. Update status as you progress.</p>
              </div>
              <select
                value={taskFilterStatus}
                onChange={(e) => setTaskFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="All">All Statuses</option>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {taskError && <p className="mt-4 text-sm text-rose-600">{taskError}</p>}

            {tasksLoading ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading assigned tasks...</div>
            ) : assignedTasks.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No tasks assigned to your account yet.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {assignedTasks.map((task) => (
                  <div key={task._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-800">{task.title}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${TASK_PRIORITY_STYLE[task.priority] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && <p className="text-sm text-slate-600">{task.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Start: {task.startDate}</span>
                          <span>Deadline: {task.deadline}</span>
                        </div>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => updateMyTaskStatus(task._id, e.target.value)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none ${TASK_STATUS_STYLE[task.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'documents' && (
          <section className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
            <div>
              <h2 className="text-xl font-semibold text-brand-900">MTP / LTP Document Links</h2>
              <p className="mt-1 text-sm text-slate-600">Upload Google Drive PDF links. LTP is per session, MTP is per AP and session.</p>
            </div>

            {docMsg && <p className="mt-4 text-sm text-brand-700">{docMsg}</p>}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-brand-900">Upload LTP (per session)</h3>
                <div className="mt-4 grid gap-3">
                  <select
                    value={ltpSession}
                    onChange={(e) => setLtpSession(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    {SESSION_OPTIONS.map((session) => (
                      <option key={session} value={session}>{session}</option>
                    ))}
                  </select>
                  <input
                    value={ltpLink}
                    onChange={(e) => setLtpLink(e.target.value)}
                    placeholder="Google Drive PDF link"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={saveLtpLink}
                    disabled={docSaving}
                    className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save LTP Link
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-brand-900">Upload MTP (per AP)</h3>
                <div className="mt-4 grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={mtpSession}
                      onChange={(e) => setMtpSession(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {SESSION_OPTIONS.map((session) => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                    <select
                      value={mtpAp}
                      onChange={(e) => setMtpAp(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      {AP_OPTIONS.map((ap) => (
                        <option key={ap} value={ap}>{ap}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    value={mtpLink}
                    onChange={(e) => setMtpLink(e.target.value)}
                    placeholder="Google Drive PDF link"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={saveMtpLink}
                    disabled={docSaving}
                    className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save MTP Link
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-brand-900">Available Links</h3>
              <div className="mt-4 overflow-auto">
                {!academicDocs.length ? (
                  <p className="text-sm text-slate-500">No document links uploaded yet.</p>
                ) : (
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Session</th>
                        <th className="px-3 py-2">AP</th>
                        <th className="px-3 py-2">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academicDocs.map((doc) => (
                        <tr key={doc._id || `${doc.type}-${doc.session}-${doc.ap || 'none'}`} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-semibold text-slate-800">{doc.type}</td>
                          <td className="px-3 py-2">{doc.session}</td>
                          <td className="px-3 py-2">{doc.ap || '-'}</td>
                          <td className="px-3 py-2">
                            <a href={doc.link} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 hover:underline">Open PDF</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
