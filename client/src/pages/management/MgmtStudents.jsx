import { useEffect, useMemo, useState } from 'react'
import { fetchStudentProgress, fetchStudents, fetchTeachers } from '../../services/api'

function ProgressBar({ pct }) {
  const color = pct >= 85 ? 'bg-green-500' : pct >= 70 ? 'bg-brand-500' : 'bg-red-400'
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  )
}

function countCompletedWeeks(apProgress) {
  const weeks = apProgress?.weeks || []
  return weeks.reduce((count, week) => {
    const hasEntry = (week.days || []).some((day) => day && day.subjects && Object.keys(day.subjects).length > 0)
    return count + (hasEntry ? 1 : 0)
  }, 0)
}

function getStudentProgressPercent(progress) {
  if (!progress?.ap) return 0
  const APS = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']
  const completed = APS.reduce((sum, ap) => sum + countCompletedWeeks(progress.ap?.[ap]), 0)
  const totalExpected = APS.length * 6
  return totalExpected ? Math.round((completed / totalExpected) * 100) : 0
}

function SubjectRow({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-slate-500 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-bold text-slate-700">{value}%</span>
    </div>
  )
}

function StudentModal({ student, progress, teacherName, onClose }) {
  const overall = getStudentProgressPercent(progress)
  const remarks = progress?.messages || []
  const apScores = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6'].map((ap) => {
    const completed = countCompletedWeeks(progress?.ap?.[ap])
    return { ap, score: Math.round((completed / 6) * 100) }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold shadow">
                {student.name.charAt(0)}
              </div>
              <h2 className="mt-2 text-xl font-bold">{student.name}</h2>
              <p className="text-sm text-brand-100">{student.grade || 'N/A'} · {student.sessionAdmitted || 'N/A'}</p>
            </div>
            <button onClick={onClose} className="rounded-full border border-white/30 bg-white/15 p-2 text-white hover:bg-white/25 transition">
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">Attendance: N/A</span>
            <span className="inline-flex rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">Overall Progress: {overall}%</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Class Teacher</p>
            <p className="text-sm font-medium text-slate-800">{teacherName || 'Not assigned'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Academic Progress (AP-wise)</p>
            <div className="space-y-2">
              {apScores.map((item) => (
                <SubjectRow key={item.ap} label={item.ap} value={item.score} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">Overall Academic Progress</span>
              <span className="font-bold text-brand-600">{overall}%</span>
            </div>
            <ProgressBar pct={overall} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Teacher Remarks</p>
            {remarks.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">No remarks submitted yet.</div>
            ) : (
              <div className="space-y-2">
                {remarks.map((message, index) => (
                  <div key={index} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 italic">"{message}"</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MgmtStudents() {
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('All')
  const [filterTeacher, setFilterTeacher] = useState('All')
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(null)
  const [selectedProgress, setSelectedProgress] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [studentData, teacherData] = await Promise.all([fetchStudents(), fetchTeachers()])
        if (!mounted) return
        setStudents(studentData)
        setTeachers(teacherData)
      } catch (e) {
        if (!mounted) return
        setError(e.message || 'Failed to load students')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const classOptions = useMemo(
    () => ['All', ...Array.from(new Set(students.map((student) => student.grade || 'Unknown')))],
    [students],
  )

  const teacherOptions = useMemo(() => ['All', ...teachers.map((teacher) => teacher.id)], [teachers])

  const filtered = students.filter((student) => {
    const query = search.trim().toLowerCase()
    const matchSearch = !query || student.name.toLowerCase().includes(query)
    const matchClass = filterClass === 'All' || (student.grade || 'Unknown') === filterClass
    const matchTeacher = filterTeacher === 'All' || student.teacherId === filterTeacher
    return matchSearch && matchClass && matchTeacher
  })

  async function openStudent(student) {
    setSelected(student)
    setSelectedProgress(null)
    try {
      const progress = await fetchStudentProgress(student.id)
      setSelectedProgress(progress)
    } catch {
      setSelectedProgress(null)
    }
  }

  function teacherNameById(id) {
    return teachers.find((teacher) => teacher.id === id)?.name || 'Unassigned'
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm">Loading students from database…</div>
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-600 shadow-sm">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Students Management</h1>
        <p className="mt-1 text-sm text-slate-500">{students.length} students in database · Click a student to view profile</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student by name…"
          title="Search student"
          className="flex-1 min-w-48 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 outline-none transition"
        />

        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          title="Filter by class"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-400 outline-none"
        >
          {classOptions.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>

        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          title="Filter by teacher"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-400 outline-none"
        >
          {teacherOptions.map((value) => (
            <option key={value} value={value}>
              {value === 'All' ? 'All Teachers' : teacherNameById(value)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-400 shadow-sm">No students match the current filters.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((student) => {
            const teacherName = teacherNameById(student.teacherId)
            return (
              <button
                key={student.id}
                onClick={() => openStudent(student)}
                className="rounded-2xl bg-white p-5 shadow-sm text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-transparent hover:border-brand-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm shadow-sm group-hover:scale-105 transition">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.grade || 'N/A'} · {student.sessionAdmitted || 'N/A'}</p>
                    <p className="truncate text-xs text-slate-400 mt-0.5">{teacherName}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Attendance</span>
                    <span className="font-bold text-slate-700">N/A</span>
                  </div>
                  <ProgressBar pct={0} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 border-slate-200">Progress from DB</span>
                  <span className="text-xs text-brand-500 font-medium group-hover:underline">View Profile →</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <StudentModal
          student={selected}
          progress={selectedProgress}
          teacherName={teacherNameById(selected.teacherId)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
