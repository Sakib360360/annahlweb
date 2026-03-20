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
  fetchStudents,
  fetchTeachers,
  updateStudent,
  updateTeacher,
} from '../services/api'

const GRADE_TO_GROUP = (grade) => {
  const numeric = Number(grade)
  if (Number.isNaN(numeric)) return grade || 'Unknown'
  if (numeric >= 1 && numeric <= 7) return `Year ${numeric}`
  return 'Year 8+'
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

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [studentForm, setStudentForm] = useState({ id: '', name: '', email: '', grade: '', phone: '', sessionAdmitted: '', password: '' })
  const [teacherForm, setTeacherForm] = useState({ id: '', name: '', email: '', subject: '', password: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }

    fetchStudents().then(setStudents).catch(() => setStudents([]))
    fetchTeachers().then(setTeachers).catch(() => setTeachers([]))
  }, [user, navigate])

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
    try {
      const created = await createStudent(studentForm)
      setStudents((prev) => [...prev, created])
      setStudentForm({ id: '', name: '', email: '', grade: '', password: '' })
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
    try {
      const created = await createTeacher(teacherForm)
      setTeachers((prev) => [...prev, created])
      setTeacherForm({ id: '', name: '', email: '', subject: '', password: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  const updateExistingTeacher = async (id) => {
    setError('')
    try {
      const updated = await updateTeacher(id, teacherForm)
      setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setTeacherForm({ id: '', name: '', email: '', subject: '', password: '' })
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
                      <input
                        value={studentForm.grade}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, grade: e.target.value }))}
                        placeholder="Grade (e.g. 5)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                      <input
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={studentForm.sessionAdmitted}
                        onChange={(e) => setStudentForm((prev) => ({ ...prev, sessionAdmitted: e.target.value }))}
                        placeholder="Session admitted"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
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
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teachers.map((teacher) => (
                          <tr key={teacher.id}>
                            <td className="px-3 py-2 text-xs font-semibold text-slate-600">{teacher.id}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{teacher.name}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">{teacher.subject}</td>
                            <td className="px-3 py-2 text-sm text-slate-700">
                              <button
                                type="button"
                                onClick={() => setTeacherForm({
                                  id: teacher.id,
                                  name: teacher.name,
                                  email: teacher.email,
                                  subject: teacher.subject,
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
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
