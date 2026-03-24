import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { fetchStudentProgress } from '../services/api'
import { getFromStorage, setInStorage } from '../utils/localStorage'

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Art']
const AP_LABELS = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']

const TEACHER_STUDENT_PROGRESS_KEY = (teacherId, studentId) => `anahl:teacher:${teacherId}:student:${studentId}:progress`

const GRADE_TO_POINTS = {
  E: 60,
  S: 75,
  B: 85,
  EX: 95,
  U: 50,
}

function mapGradeToPoint(grade) {
  if (!grade) return 0
  const normalized = grade.toString().trim().toUpperCase()
  return GRADE_TO_POINTS[normalized] ?? 0
}

function getStudentProgress(user) {
  if (!user?.teacherId) return null
  return null
}

function computeChartData(progress, subject) {
  if (!progress || !progress.ap) return []

  const rows = AP_LABELS.map((ap) => {
    const row = { ap }
    const subjectTotals = []

    SUBJECTS.forEach((sub) => {
      const apData = progress.ap[ap]
      if (!apData || !Array.isArray(apData.weeks)) return

      const values = []
      apData.weeks.forEach((week) => {
        ;(week.days || []).forEach((day) => {
          const grade = (day && day.subjects && day.subjects[sub]) || null
          if (!grade) return
          values.push(mapGradeToPoint(grade))
        })
      })

      const formative = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
      const summative = Math.min(100, formative + 10)
      const total = Math.round(formative * 0.8 + summative * 0.2)

      if (subject === null) {
        row[sub] = total
      }

      subjectTotals.push(total)
    })

    row.overall = subjectTotals.length ? Math.round(subjectTotals.reduce((a, b) => a + b, 0) / subjectTotals.length) : 0
    return row
  })

  return rows
}

function downloadReportCard(student, progress) {
  const lines = []
  lines.push(['Student', student.name].join(','))
  lines.push(['ID', student.id].join(','))
  lines.push(['Grade', student.grade ?? 'N/A'].join(','))
  lines.push(['', ''])

  const header = ['Subject', ...AP_LABELS.map((ap) => `${ap} (F)`), ...AP_LABELS.map((ap) => `${ap} (S)`), 'Average'].join(',')
  lines.push(header)

  const computedAssessmentRows = SUBJECTS.map((subject) => {
    const apScores = AP_LABELS.map((ap) => {
      const apData = progress?.ap?.[ap]
      if (!apData) return { formative: 0, summative: 0 }

      const values = []
      apData.weeks.forEach((week) => {
        ;(week.days || []).forEach((day) => {
          const grade = (day && day.subjects && day.subjects[subject]) || null
          if (!grade) return
          values.push(mapGradeToPoint(grade))
        })
      })

      const formative = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
      const summative = Math.min(100, formative + 10)
      return { formative, summative }
    })

    const average = apScores.length
      ? Math.round(apScores.reduce((acc, curr) => acc + Math.round(curr.formative * 0.8 + curr.summative * 0.2), 0) / apScores.length)
      : 0

    return { subject, apScores, average }
  })

  computedAssessmentRows.forEach((subjectRow) => {
    const formative = subjectRow.apScores.map((a) => a.formative)
    const summative = subjectRow.apScores.map((a) => a.summative)
    const total = subjectRow.apScores.map((a) => Math.round(a.formative * 0.8 + a.summative * 0.2))
    const average = subjectRow.average || (total.length ? Math.round(total.reduce((a, b) => a + b, 0) / total.length) : 0)
    lines.push([subjectRow.subject, ...formative, ...summative, average].join(','))
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `report-card-${student.id}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function getMessageKey(studentId) {
  return `anahl:messages:student:${studentId}`
}

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/')
      return
    }

    const loadProgress = async () => {
      try {
        const prog = await fetchStudentProgress(user.id)
        setProgress(prog ?? { ap: {} })
      } catch (error) {
        console.error('Failed to fetch student progress from server', error)
        setProgress({ ap: {} })
      }
    }

    loadProgress()

    const stored = getFromStorage(getMessageKey(user.id), [])
    setMessages(stored)
  }, [user, navigate])

  const chartData = useMemo(() => {
    if (!progress) return []
    return computeChartData(progress, selectedSubject)
  }, [progress, selectedSubject])

  const assessmentRows = useMemo(() => {
    if (!progress || !progress.ap) return []

    return SUBJECTS.map((subject) => {
      const apScores = AP_LABELS.map((ap) => {
        const apData = progress.ap[ap]
        if (!apData || !Array.isArray(apData.weeks)) return { formative: 0, summative: 0, total: 0 }

        const values = []
        apData.weeks.forEach((week) => {
          ;(week.days || []).forEach((day) => {
            const grade = (day && day.subjects && day.subjects[subject]) || null
            if (!grade) return
            values.push(mapGradeToPoint(grade))
          })
        })

        const formative = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
        const summative = Math.min(100, formative + 10)
        const total = Math.round(formative * 0.8 + summative * 0.2)
        return { formative, summative, total }
      })

      const average = apScores.length ? Math.round(apScores.reduce((acc, curr) => acc + curr.total, 0) / apScores.length) : 0

      return { subject, apScores, average }
    })
  }, [progress])


  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return
    const next = [
      {
        id: `${Date.now()}`,
        sender: 'student',
        text: newMessage.trim(),
        createdAt: new Date().toISOString(),
      },
      ...messages,
    ]
    setMessages(next)
    setInStorage(getMessageKey(user.id), next)
    setNewMessage('')
  }

  if (!user) return null

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-brand-900">Student Dashboard</h1>
              <p className="mt-2 text-slate-600">
                Welcome back, <span className="font-semibold text-brand-900">{user.name}</span>. Here is your personalised progress report.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => downloadReportCard(user, progress)}
                className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gold-600"
                disabled={!progress}
              >
                Download report card
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-xl border border-brand-600 bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
            <h2 className="text-xl font-semibold text-brand-900">Profile</h2>
            <dl className="mt-6 space-y-3 text-slate-700">
              <div className="flex items-center justify-between">
                <dt className="font-medium">ID</dt>
                <dd>{user.id}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium">Grade</dt>
                <dd>{user.grade ?? 'N/A'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium">Role</dt>
                <dd className="capitalize">{user.role}</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-900">Progress Overview</h2>
                  <p className="mt-1 text-sm text-slate-600">Track your assessment performance across all subjects.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Show:</label>
                  <select
                    value={selectedSubject ?? 'overall'}
                    onChange={(e) => setSelectedSubject(e.target.value === 'overall' ? null : e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    <option value="overall">Overall</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="ap" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {!selectedSubject && (
                      <>
                        {SUBJECTS.map((subject, index) => (
                          <Line
                            key={subject}
                            type="monotone"
                            dataKey={subject}
                            stroke={['#1d4ed8', '#14b8a6', '#d97706', '#db2777', '#9333ea'][index % 5]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        ))}
                        <Line
                          type="monotone"
                          dataKey="overall"
                          stroke="#0f172a"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </>
                    )}
                    {selectedSubject && (
                      <Line type="monotone" dataKey={selectedSubject} stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <h2 className="text-xl font-semibold text-brand-900">Assessment Summary</h2>
              <p className="mt-1 text-sm text-slate-600">Scores are weighted (80% formative, 20% summative).</p>

              <div className="mt-6 overflow-auto">
                {!assessmentRows.length ? (
                  <p className="p-4 text-sm text-slate-600">No teacher-submitted progress yet. Your teacher should fill in assessment grades for real values.</p>
                ) : (
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3">Subject</th>
                        {AP_LABELS.map((ap) => (
                          <th key={`${ap}-f`} className="px-4 py-3">
                            {ap} (F)
                          </th>
                        ))}
                        {AP_LABELS.map((ap) => (
                          <th key={`${ap}-s`} className="px-4 py-3">
                            {ap} (S)
                          </th>
                        ))}
                        <th className="px-4 py-3">Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assessmentRows.map(({ subject, apScores, average }) => (
                        <tr key={subject} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{subject}</td>
                          {apScores.map(({ formative }, apIndex) => (
                            <td key={`${subject}-${AP_LABELS[apIndex]}-f`} className="px-4 py-3">
                              {formative === 0 ? '-' : formative}
                            </td>
                          ))}
                          {apScores.map(({ summative }, apIndex) => (
                            <td key={`${subject}-${AP_LABELS[apIndex]}-s`} className="px-4 py-3">
                              {summative === 0 ? '-' : summative}
                            </td>
                          ))}
                          <td className="px-4 py-3 font-semibold text-brand-900">{average || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
            <h2 className="text-xl font-semibold text-brand-900">Messages</h2>
            <p className="mt-1 text-sm text-slate-600">Send a quick note to your teacher. Messages are saved locally.</p>

            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-600">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-brand-900">
                          {msg.sender === 'student' ? 'You' : 'Teacher'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write your message…"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
