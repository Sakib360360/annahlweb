import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getFromStorage, setInStorage } from '../utils/localStorage'
import { fetchStudents } from '../services/api'
import { getConversation, sendMessage } from '../services/messages'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'

const CLASS_GROUPS = [
  'Nursery',
  'Reception',
  'Year 1BG',
  'Year 1G',
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

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Art']
const GRADE_OPTIONS = [
  { value: 'EM', label: 'Emerging' },
  { value: 'S', label: 'Standard' },
  { value: 'B', label: 'Beyond' },
  { value: 'EX', label: 'Exceptional' },
]

const APS = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']
const DAYS_PER_WEEK = 6

const normalizeGroup = (grade) => {
  if (!grade) return 'Unknown'

  if (typeof grade === 'string') {
    const normalized = grade.trim()

    // Keep exact class group labels for mapped year-group values
    if (CLASS_GROUPS.includes(normalized)) return normalized

    // Normalize numeric strings or 'Year X' values to group labels
    const yearMatch = normalized.match(/^Year\s*(\d+)(B|G|BG)?$/i)
    if (yearMatch) {
      const yearNumber = Number(yearMatch[1])
      const suffix = (yearMatch[2] || '').toUpperCase()
      if (yearNumber >= 1 && yearNumber <= 9) {
        if (suffix && ['B', 'G', 'BG'].includes(suffix)) {
          return `Year ${yearNumber}${suffix}`
        }
        if (yearNumber <= 6) return `Year ${yearNumber}`
        return `Year ${yearNumber}`
      }
    }

    const numeric = Number(normalized)
    if (!Number.isNaN(numeric)) {
      if (numeric >= 1 && numeric <= 9) return `Year ${numeric}`
    }

    return normalized
  }

  return 'Unknown'
}

const formatDate = (date) => date.toISOString().slice(0, 10)

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d
}

const getWeekDates = (date) => {
  const start = getMonday(date)
  return Array.from({ length: DAYS_PER_WEEK }).map((_, idx) => {
    const d = new Date(start)
    d.setDate(start.getDate() + idx)
    return d
  })
}

const getTodayDayIndex = () => {
  const dow = new Date().getDay() // 0 is Sunday
  if (dow === 0) return DAYS_PER_WEEK - 1
  return Math.min(DAYS_PER_WEEK - 1, dow - 1)
}

const teacherStudentProgressKey = (teacherId, studentId) => `anahl:teacher:${teacherId}:student:${studentId}:progress`

const buildEmptyProgress = () => {
  return {
    ap: APS.reduce((acc, ap) => {
      acc[ap] = { weeks: Array.from({ length: 6 }, () => ({ days: [] })) }
      return acc
    }, {}),
    messages: [],
  }
}

const buildEmptyDay = () => ({
  subjects: SUBJECTS.reduce((acc, subject) => {
    acc[subject] = 'S'
    return acc
  }, {}),
  resources: [],
})

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(CLASS_GROUPS[0])
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [progress, setProgress] = useState(null)

  const [selectedAP, setSelectedAP] = useState(APS[0])
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedDayIndex, setSelectedDayIndex] = useState(getTodayDayIndex())

  const [messageText, setMessageText] = useState('')

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
      const group = normalizeGroup(student.grade)
      if (!groups[group]) groups[group] = []
      groups[group].push(student)
    })
    return groups
  }, [students])

  const filteredStudents = useMemo(() => studentGroups[selectedGroup] ?? [], [studentGroups, selectedGroup])

  const selectedStudent = useMemo(
    () => filteredStudents.find((student) => student.id === selectedStudentId) || null,
    [filteredStudents, selectedStudentId],
  )

  const weekDates = useMemo(() => getWeekDates(new Date()), [])
  const selectedDateKey = useMemo(() => formatDate(weekDates[selectedDayIndex] ?? new Date()), [weekDates, selectedDayIndex])

  useEffect(() => {
    if (!selectedStudent || !user) return

    const key = teacherStudentProgressKey(user.id, selectedStudent.id)
    const stored = getFromStorage(key, null)

    const base = stored ?? buildEmptyProgress()

    // migrate old storage structure
    if (stored && !stored.ap) {
      const migrated = buildEmptyProgress()
      migrated.messages = stored.messages || []
      if (stored.weeks) {
        stored.weeks.forEach((week, idx) => {
          const day = buildEmptyDay()
          if (week.dailyGrades) {
            SUBJECTS.forEach((subject, subjectIdx) => {
              day.subjects[subject] = week.dailyGrades[subjectIdx] || 'S'
            })
          }
          migrated.ap[APS[0]].weeks[idx].days = [day]
        })
      }
      setProgress(migrated)
      setInStorage(key, migrated)
    } else {
      setProgress(base)
    }

    setSelectedAP(APS[0])
    setSelectedWeek(1)
    setSelectedDayIndex(getTodayDayIndex())
  }, [selectedStudent, user])

  const saveProgress = (next) => {
    if (!selectedStudent || !user) return
    const key = teacherStudentProgressKey(user.id, selectedStudent.id)
    const merged = { ...progress, ...next }
    setProgress(merged)
    setInStorage(key, merged)
  }

  const dayRecord = useMemo(() => {
    if (!progress) return buildEmptyDay()
    const apData = progress.ap?.[selectedAP]
    const weekData = apData?.weeks?.[selectedWeek - 1]
    const day = weekData?.days?.[selectedDayIndex]
    return day || buildEmptyDay()
  }, [progress, selectedAP, selectedWeek, selectedDayIndex])

  const updateDayRecord = (patch) => {
    if (!progress) return
    const next = { ...progress }
    next.ap = { ...progress.ap }
    next.ap[selectedAP] = { ...next.ap[selectedAP] }
    next.ap[selectedAP].weeks = [...next.ap[selectedAP].weeks]

    const weekData = { ...next.ap[selectedAP].weeks[selectedWeek - 1] }
    const days = [...(weekData.days || Array(DAYS_PER_WEEK).fill(null))]
    days[selectedDayIndex] = { ...dayRecord, ...patch }
    weekData.days = days
    next.ap[selectedAP].weeks[selectedWeek - 1] = weekData

    saveProgress(next)
  }

  const setSubjectGrade = (subject, grade) => {
    updateDayRecord({ subjects: { ...dayRecord.subjects, [subject]: grade } })
  }

  const addResource = (resource) => {
    updateDayRecord({ resources: [...(dayRecord.resources || []), resource] })
  }

  const dayAverage = useMemo(() => {
    const values = Object.values(dayRecord.subjects).map((g) => {
      const idx = GRADE_OPTIONS.findIndex((opt) => opt.value === g)
      return idx >= 0 ? idx + 1 : 0
    })
    const valid = values.filter(Boolean)
    if (!valid.length) return 0
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)
  }, [dayRecord])

  const apAverage = useMemo(() => {
    if (!progress) return 0
    const apData = progress.ap?.[selectedAP]
    if (!apData?.weeks) return 0

    const allGrades = apData.weeks.flatMap((week) =>
      (week.days || []).flatMap((day) =>
        Object.values(day.subjects || {}).map((g) => {
          const idx = GRADE_OPTIONS.findIndex((opt) => opt.value === g)
          return idx >= 0 ? idx + 1 : 0
        }),
      ),
    )

    const valid = allGrades.filter(Boolean)
    if (!valid.length) return 0
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)
  }, [progress, selectedAP])

  const conversation = useMemo(() => {
    if (!user || !selectedStudent) return []
    return getConversation(user.id, selectedStudent.id)
  }, [user, selectedStudent])

  const handleSendMessage = () => {
    if (!messageText.trim() || !user || !selectedStudent) return
    sendMessage({ from: user.id, to: selectedStudent.id, text: messageText.trim() })
    setMessageText('')
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
                Welcome back, <span className="font-semibold text-brand-900">{user.name}</span>.
              </p>
            </div>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <Card>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Select class group</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value)
                      setSelectedStudentId(null)
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    {CLASS_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">Students</p>
                  <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white">
                    {filteredStudents.length === 0 ? (
                      <p className="p-4 text-sm text-slate-600">No students found in this group.</p>
                    ) : (
                      filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm font-medium transition ${
                            selectedStudentId === student.id
                              ? 'bg-brand-50 text-brand-900'
                              : 'bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{student.name}</span>
                          <span className="text-xs font-semibold text-slate-500">{student.grade}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          <section className="lg:col-span-3">
            {!selectedStudent ? (
              <Card>
                <div className="text-center">
                  <p className="text-lg font-semibold text-brand-900">Select a student to start logging progress</p>
                  <p className="mt-2 text-sm text-slate-600">Use AP / week / day controls to track daily assessments and attach resources.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Student</p>
                      <p className="text-lg font-semibold text-brand-900">{selectedStudent.name}</p>
                      <p className="text-sm text-slate-600">Grade {selectedStudent.grade} · ID {selectedStudent.id}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">Assessment period (AP)</label>
                        <select
                          value={selectedAP}
                          onChange={(e) => setSelectedAP(e.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        >
                          {APS.map((ap) => (
                            <option key={ap} value={ap}>
                              {ap}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">Week</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Array.from({ length: 6 }, (_, idx) => idx + 1).map((week) => (
                            <button
                              key={week}
                              type="button"
                              onClick={() => setSelectedWeek(week)}
                              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                selectedWeek === week
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              W{week}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">Day</label>
                        <select
                          value={selectedDayIndex}
                          onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        >
                          {weekDates.map((date, idx) => (
                            <option key={idx} value={idx}>
                              {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatCard label="Daily average" value={`${dayAverage} / 4`} />
                      <StatCard label="AP average" value={`${apAverage} / 4`} />
                      <StatCard label="Subjects" value={`${SUBJECTS.length}`} />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-brand-900">Daily assessment</h3>
                        <p className="text-sm text-slate-600">Enter the formative grade for each subject.</p>
                      </div>
                      <div className="text-sm text-slate-500">
                        {weekDates[selectedDayIndex]?.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className="overflow-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {SUBJECTS.map((subject) => (
                            <tr key={subject} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-800">{subject}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={dayRecord.subjects?.[subject] ?? 'S'}
                                  onChange={(e) => setSubjectGrade(subject, e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                                >
                                  {GRADE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700">Lesson resources</h4>
                        <p className="mt-1 text-sm text-slate-600">Add a Google Drive link for today's lesson plan.</p>

                        <ResourceForm onSave={addResource} />

                        {dayRecord.resources?.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {dayRecord.resources.map((res, idx) => (
                              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                <p className="font-semibold text-slate-800">{res.title}</p>
                                <p className="mt-1 text-xs text-slate-600">{res.description}</p>
                                <a
                                  href={res.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
                                >
                                  Open link
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-700">Messages</h4>
                        <p className="mt-1 text-sm text-slate-600">Send quick updates to the student.</p>

                        <div className="mt-4 space-y-3">
                          {conversation.length === 0 ? (
                            <p className="text-sm text-slate-600">No messages yet. Your messages will appear here.</p>
                          ) : (
                            conversation.map((msg) => (
                              <div
                                key={msg.id}
                                className={`rounded-2xl border border-slate-200 bg-white p-4 ${msg.from === user.id ? 'bg-brand-50' : ''}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-slate-700">
                                    {msg.from === user.id ? 'You' : selectedStudent.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(msg.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-700">{msg.text}</p>
                              </div>
                            ))
                          )}

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder="Write a message…"
                              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                            />
                            <Button onClick={handleSendMessage}>Send</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function ResourceForm({ onSave }) {
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')

  const handleSave = () => {
    if (!title.trim() || !link.trim()) return
    onSave({ title: title.trim(), link: link.trim(), description: description.trim() })
    setTitle('')
    setLink('')
    setDescription('')
  }

  return (
    <div className="space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Resource title"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Google Drive link"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        rows={3}
      />
      <Button onClick={handleSave} className="w-full">
        Add resource
      </Button>
    </div>
  )
}
