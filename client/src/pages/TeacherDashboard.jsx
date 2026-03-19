import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getFromStorage, setInStorage } from '../utils/localStorage'
import { fetchStudents } from '../services/api'

const GRADE_GROUPS = [
  'Nursery',
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Year 5',
  'Year 6',
  'Year 7',
  'Year 8+',
]

const GRADE_TO_GROUP = (grade) => {
  if (!grade) return 'Unknown'
  const numeric = Number(grade)
  if (Number.isNaN(numeric)) return grade
  if (numeric >= 1 && numeric <= 7) return `Year ${numeric}`
  return 'Year 8+'
}

const DAILY_GRADES = ['Emerging', 'Standard', 'Beyond', 'Exceptional']
const WEEKS = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']

const getTeacherStudentStorageKey = (teacherId, studentId) => `anahl:teacher:${teacherId}:student:${studentId}`

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [notes, setNotes] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/')
      return
    }

    fetchStudents().then(setStudents).catch(() => setStudents([]))
  }, [user, navigate])

  const studentGroups = useMemo(() => {
    const groups = {}
    students.forEach((student) => {
      const group = GRADE_TO_GROUP(student.grade)
      if (!groups[group]) groups[group] = []
      groups[group].push(student)
    })
    return groups
  }, [students])

  const selectedStudent = useMemo(() => students.find((student) => student.id === selectedId), [students, selectedId])

  useEffect(() => {
    if (!selectedStudent || !user) return

    const key = getTeacherStudentStorageKey(user.id, selectedStudent.id)

    const defaultWeek = () => ({
      dailyGrades: Array(6).fill('Standard'),
      heaps: {
        previousLesson: '',
        newLesson: '',
        revision: '',
        competition: '',
        teacherComment: '',
      },
    })

    const stored = getFromStorage(key, {
      weeks: Array.from({ length: 6 }, () => defaultWeek()),
      selectedWeek: 0,
      messages: [],
    })

    setSelectedWeek(stored.selectedWeek ?? 0)
    setNotes(stored)
  }, [selectedStudent, user])

  const saveNotes = (next) => {
    if (!selectedStudent || !user) return
    const key = getTeacherStudentStorageKey(user.id, selectedStudent.id)
    const updated = { ...notes, ...next }
    setNotes(updated)
    setInStorage(key, updated)
  }

  const currentWeekData = useMemo(() => {
    return notes?.weeks?.[selectedWeek] || null
  }, [notes, selectedWeek])

  const weeklyAverage = useMemo(() => {
    if (!currentWeekData?.dailyGrades) return 0
    const numeric = currentWeekData.dailyGrades
      .map((grade) => DAILY_GRADES.indexOf(grade) + 1)
      .filter(Boolean)
    if (!numeric.length) return 0
    return (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(2)
  }, [currentWeekData])

  const apAverage = useMemo(() => {
    if (!notes?.weeks) return 0
    const weekAverages = notes.weeks.map((week) => {
      const numeric = week.dailyGrades
        ? week.dailyGrades.map((grade) => DAILY_GRADES.indexOf(grade) + 1).filter(Boolean)
        : []
      if (!numeric.length) return 0
      return numeric.reduce((a, b) => a + b, 0) / numeric.length
    })
    const total = weekAverages.reduce((a, b) => a + b, 0)
    return weekAverages.length ? (total / weekAverages.length).toFixed(2) : 0
  }, [notes])

  const handleSendMessage = () => {
    if (!message.trim() || !user || !selectedStudent) return
    const nextMessages = [
      {
        id: `${Date.now()}`,
        sender: 'teacher',
        text: message.trim(),
        createdAt: new Date().toISOString(),
      },
      ...(notes?.messages ?? []),
    ]

    saveNotes({ messages: nextMessages })
    setMessage('')
  }

  if (!user) return null

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-brand-900">Teacher Dashboard</h1>
              <p className="mt-2 text-slate-600">
                Welcome back, <span className="font-semibold text-brand-900">{user.name}</span>. Select a student to view their profile and update progress.
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

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur">
              <h2 className="text-lg font-semibold text-brand-900">Year groups</h2>
              <p className="mt-1 text-sm text-slate-600">Pick a student to view their progress.</p>

              <div className="mt-6 space-y-5">
                {Object.keys(studentGroups)
                  .sort((a, b) => GRADE_GROUPS.indexOf(a) - GRADE_GROUPS.indexOf(b))
                  .map((group) => (
                    <div key={group} className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-700">{group}</h3>
                      <div className="space-y-1">
                        {studentGroups[group].map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => setSelectedId(student.id)}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                              selectedId === student.id
                                ? 'bg-brand-600 text-white'
                                : 'bg-white text-slate-700 hover:bg-brand-50'
                            }`}
                          >
                            <span>{student.name}</span>
                            <span className="text-xs font-semibold text-slate-500">{student.grade}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3">
            {!selectedStudent ? (
              <div className="rounded-3xl border border-white/30 bg-white/70 p-10 text-center shadow-soft backdrop-blur">
                <p className="text-lg font-semibold text-brand-900">Select a student to see details</p>
                <p className="mt-2 text-sm text-slate-600">You can update weekly grades, add notes, and send messages.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-brand-900">{selectedStudent.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">Grade {selectedStudent.grade} · ID {selectedStudent.id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                        {selectedStudent.email}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-700">
                        Assigned: {selectedStudent.teacherId ?? 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">Weekly grading (6 days)</h3>
                      <p className="mt-1 text-sm text-slate-600">Track daily effort across the week.</p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {WEEKS.map((weekLabel, idx) => (
                          <button
                            key={weekLabel}
                            type="button"
                            onClick={() => {
                              setSelectedWeek(idx)
                              saveNotes({ selectedWeek: idx })
                            }}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                              selectedWeek === idx
                                ? 'bg-brand-600 text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {weekLabel}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 space-y-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-14 text-xs font-semibold text-slate-600">Day {idx + 1}</span>
                            <select
                              value={currentWeekData?.dailyGrades?.[idx] ?? 'Standard'}
                              onChange={(e) => {
                                const nextGrades = [...(currentWeekData?.dailyGrades ?? Array(6).fill('Standard'))]
                                nextGrades[idx] = e.target.value
                                const nextWeeks = [...(notes?.weeks ?? Array.from({ length: 6 }, () => ({
                                  dailyGrades: Array(6).fill('Standard'),
                                  heaps: {
                                    previousLesson: '',
                                    newLesson: '',
                                    revision: '',
                                    competition: '',
                                    teacherComment: '',
                                  },
                                })))]
                                nextWeeks[selectedWeek] = { ...nextWeeks[selectedWeek], dailyGrades: nextGrades }
                                saveNotes({ weeks: nextWeeks })
                              }}
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                            >
                              {DAILY_GRADES.map((grade) => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-800">Weekly average</p>
                        <p className="mt-1">{weeklyAverage} / 4.00</p>
                        <p className="mt-2 text-xs text-slate-600">AP average (6 weeks): {apAverage} / 4.00</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">HEAPS summary</h3>
                      <p className="mt-1 text-sm text-slate-600">Capture progress notes for the next lesson.</p>

                      <div className="mt-4 grid gap-3">
                        {[
                          { label: 'Previous lesson', key: 'previousLesson' },
                          { label: 'New lesson', key: 'newLesson' },
                          { label: 'Revision', key: 'revision' },
                          { label: 'Competition', key: 'competition' },
                        ].map(({ label, key }) => (
                          <label key={key} className="block">
                            <span className="text-sm font-medium text-slate-700">{label}</span>
                            <input
                              value={currentWeekData?.heaps?.[key] ?? ''}
                              onChange={(e) => {
                                const nextWeeks = [...(notes?.weeks ?? Array.from({ length: 6 }, () => ({
                                  dailyGrades: Array(6).fill('Standard'),
                                  heaps: {
                                    previousLesson: '',
                                    newLesson: '',
                                    revision: '',
                                    competition: '',
                                    teacherComment: '',
                                  },
                                })))]
                                nextWeeks[selectedWeek] = {
                                  ...nextWeeks[selectedWeek],
                                  heaps: {
                                    ...nextWeeks[selectedWeek].heaps,
                                    [key]: e.target.value,
                                  },
                                }
                                saveNotes({ weeks: nextWeeks })
                              }}
                              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                              placeholder={`Enter ${label.toLowerCase()}`}
                            />
                          </label>
                        ))}
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">Teacher comment</span>
                          <textarea
                            value={currentWeekData?.heaps?.teacherComment ?? ''}
                            onChange={(e) => {
                              const nextWeeks = [...(notes?.weeks ?? Array.from({ length: 6 }, () => ({
                                dailyGrades: Array(6).fill('Standard'),
                                heaps: {
                                  previousLesson: '',
                                  newLesson: '',
                                  revision: '',
                                  competition: '',
                                  teacherComment: '',
                                },
                              })))]
                              nextWeeks[selectedWeek] = {
                                ...nextWeeks[selectedWeek],
                                heaps: {
                                  ...nextWeeks[selectedWeek].heaps,
                                  teacherComment: e.target.value,
                                },
                              }
                              saveNotes({ weeks: nextWeeks })
                            }}
                            className="mt-2 h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                            placeholder="Add a short comment for the student"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-semibold text-slate-700">Messages</h3>
                    <p className="mt-1 text-sm text-slate-600">Send a note to the student. Messages are stored locally.</p>

                    <div className="mt-4 space-y-3">
                      {notes?.messages?.length > 0 ? (
                        notes.messages.map((msg) => (
                          <div key={msg.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-brand-900">{msg.sender === 'teacher' ? 'You' : 'Student'}</span>
                              <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{msg.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600">No messages yet. Send your first message below.</p>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Write a message…"
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
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
